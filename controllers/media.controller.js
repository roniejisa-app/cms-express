const { Media } = require('@models/index');
require('dotenv').config();
const { createFolder } = require('@utils/uploadFile');
const { Op } = require('sequelize');
const db = require('@utils/sequelize');
const fs = require('fs');
const { recursiveFolder, recursiveHTMLFolder } = require('@utils/all');
const Cache = require('@utils/cache');
const { CACHE_CLEAR_CACHE_ASIDE_FOLDER, CACHE_ASIDE_FOLDER } = require('../constants/cache');
const IS_NOT_ADD = false;
module.exports = {
    index: async (req, res, next) => {
        try {
            let mediaId = null;
            let listMedias = [];
            let mediaIds = [];
            if (req.params[0]) {
                mediaIds = req.params[0].split('/');
                mediaId = mediaIds[mediaIds.length - 1];
                /**
                * 
                * Chỗ này cần kiểm tra nếu các liên kết của các thư mục không đúng thứ tự hay sai thì redirect về medias
                * 1. Kiểm tra độ dài của list
                * 2. Check parent thằng sau có bằng id thằng trước hay không
                */
                try {
                    listMedias = await Media.findAndCountAll({
                        attributes: ["id", 'media_id', 'filename'],
                        where: {
                            id: {
                                [Op.in]: mediaIds
                            },
                            is_file: false
                        },
                        order: [
                            ["id", "ASC"]
                        ]
                    });
                } catch (e) {
                    return res.redirect('/404');
                }
                if (listMedias.count !== mediaIds.length) {
                    return res.sendStatus(404);
                }
                isParent = true;
                for (var i = 1; i < listMedias.rows.length; i++) {
                    if (listMedias.rows[i].media_id !== listMedias.rows[i - 1].id) {
                        return res.sendStatus(404);
                    }
                }
                let idHrefMedia = '';
                for (var i = 0; i < listMedias.rows.length; i++) {
                    idHrefMedia = i === 0 ? listMedias.rows[i].id : (idHrefMedia + '/' + listMedias.rows[i].id);
                    listMedias.rows[i].parent_id = idHrefMedia;
                }
            }

            const { page, isJson } = req.query;
            const limit = 15;
            const offset = page && page > 1 ? (page - 1) * limit : 0;
            let files = []; folders = [];
            try {
                files = await Media.findAndCountAll({
                    where: {
                        is_file: true,
                        media_id: mediaId
                    },
                    order: [
                        ["id", "DESC"]
                    ],
                    limit,
                    offset
                });
            } catch (e) {
                return res.redirect('/404');
            }
            if (isJson) {
                return res.json(files);
            }
            try {
                folders = await Media.findAndCountAll({
                    where: {
                        is_file: false,
                        media_id: mediaId
                    },
                    order: [
                        ["id", "ASC"]
                    ],
                })
            } catch (e) {
                return res.redirect('/404');
            }
            let clearCache = await Cache.get(CACHE_CLEAR_CACHE_ASIDE_FOLDER);
            let asideFolders = await Cache.findOrCreate(CACHE_ASIDE_FOLDER, async function () {
                let asideFolders = [];
                try {
                    asideFolders = await Media.findAll({
                        where: {
                            is_file: false,
                        },
                        order: [
                            ["id", "ASC"]
                        ],
                    });
                } catch (e) {
                    asideFolders = [];
                }
                await Cache.set(CACHE_CLEAR_CACHE_ASIDE_FOLDER, false)
                return recursiveFolder(asideFolders);
            }, clearCache);
            res.render('media/index', {
                layout: "layouts/media"
                , folders, files, req, listMedias, asideFolders, recursiveHTMLFolder, mediaIds
            })
        } catch (e) {
            next(e);
        }
    },
    addFolder: async (req, res) => {
        let body = await req.validate(req.body, Media.validateFolder())
        if (body) {
            let { media_id } = req.body;
            if (media_id && media_id.indexOf('/') === 0) {
                media_id = media_id.slice(1);
            }

            if (media_id && media_id.lastIndexOf('/') === media_id.length - 1) {
                media_id = media_id.slice(-1);
            }

            let pathStarts = [];
            if (media_id && media_id.length) {
                try {
                    const listMediaParent = await Media.findAll({
                        where: {
                            id: {
                                [Op.in]: media_id.split('/')
                            }
                        },
                        order: [
                            ["id", "ASC"]
                        ]
                    })
                    pathStarts = Array.from(listMediaParent);
                } catch (e) {
                    return res.json({
                        message: e.message,
                        status: 'NOT OK'
                    })
                }
            }
            pathStarts.push({
                filename: body.folderName
            })
            let pathAbsolute = pathStarts;
            const dataFolder = createFolder(pathAbsolute);
            await Cache.set(CACHE_CLEAR_CACHE_ASIDE_FOLDER, true);
            if (dataFolder.status) {
                try {
                    const folder = await Media.create({
                        filename: dataFolder.name,
                        path_absolute: dataFolder.pathAbsolute,
                        path: dataFolder.path,
                        is_file: false,
                        media_id: dataFolder.mediaId,
                    })
                    return res.json({
                        folder,
                        message: 'Tạo thư mục thành công',
                        status: 200
                    })
                } catch (e) {
                    return res.json({
                        status: 'NOT OK',
                        message: e.message
                    })
                }
            }
        } else {
            const errors = req.flash('errors');
            return res.json({
                status: 'NOT OK',
                errors
            })
        }
    },
    addFile: async (req, res) => {
        if (req.files && req.files.length) {
            let { media_id } = req.body;
            if (media_id && media_id.indexOf('/') === 0) {
                media_id = media_id.slice(1);
            }

            if (media_id && media_id.lastIndexOf('/') === media_id.length - 1) {
                media_id = media_id.slice(-1);
            }

            let pathStarts = [];
            let listMediaParent = [];
            if (media_id && media_id.length) {
                try {
                    listMediaParent = await Media.findAll({
                        where: {
                            id: {
                                [Op.in]: media_id.split('/')
                            },
                        },
                        order: [
                            ["id", "ASC"]
                        ]
                    })
                } catch (e) {
                    return res.status(100).json({
                        status: 100,
                        message: e.message
                    });
                }
                pathStarts = Array.from(listMediaParent);
            }
            let pathAbsolute = pathStarts;
            const dataFolder = createFolder(pathAbsolute, IS_NOT_ADD);
            let successFiles = [];
            let errorFiles = [];
            for (var i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const originalname = req.files[i].originalname;
                var indexOfExtension = originalname.lastIndexOf('.');
                var filename = originalname.slice(0, indexOfExtension);
                const extension = originalname.slice(indexOfExtension + 1);
                var filePath = dataFolder.fullPath + '/' + originalname;
                let number = 2;
                let flagName = true;
                /** Kiểm tra file đã tồn tại thì tạo file khác nhưng ảnh lưu tên khác */
                while (fs.existsSync(filePath)) {
                    const newFileName = filename + '-' + number + '.' + extension;
                    flagName = false;
                    filePath = dataFolder.fullPath + '/' + newFileName;
                    number++;
                }
                try {
                    fs.writeFileSync(filePath, req.files[i].buffer);
                    if (!flagName) {
                        filename = filename + '-' + (number - 1);
                    }
                    successFiles.push({
                        filename: originalname,
                        media_id: dataFolder.mediaId,
                        path_absolute: dataFolder.pathAbsolute + '/' + filename + '.' + extension,
                        path: filename + '.' + extension,
                        is_file: true,
                        extension: extension,
                        customs: JSON.stringify({
                            filename: originalname,
                            media_id: dataFolder.mediaId,
                            pathAbsolute: dataFolder.pathAbsolute + '/' + filename + '.' + extension,
                            path: filename + '.' + extension,
                            extension: extension,
                            size: file.size,
                            encoding: file.encoding,
                            type: file.mimetype,
                            created_at: new Date().getTime()
                        })
                    })
                } catch (e) {
                    errorFiles.push({
                        filename: originalname
                    })
                }
            }
            successFiles = await Promise.all(successFiles.map(body => {
                return Media.create(body);
            }))

            res.json({
                successFiles,
                message: errorFiles.length > 0 ? 'Một số file tải lên không thành công' : 'Tải file thành công',
                errorFiles,
                status: 200,
            })
        } else {
            res.json({
                status: 100,
                message: 'Vui lòng chọn file'
            })
        }
    },
    editFolder: async (req, res) => {
        const { id } = req.params;
        const { folderName } = req.body;
        try {
            await Media.update({ filename: folderName }, {
                where: {
                    id
                }
            })
            await Cache.set(CACHE_CLEAR_CACHE_ASIDE_FOLDER, true);
            res.json({
                status: 200,
                folderName,
                message: "Thay đổi folder thành công!"
            })
        } catch (e) {
            res.json({
                status: 100,
                message: "Thay đổi folder không thành công!"
            })
        }
    },
    getFolder: async (req, res) => {
        let id = req.params[0] ?? '';
        const lastId = id.split('/').pop();
        const [asideFolders] = await db.sequelize.query(`SELECT *,(SELECT id FROM medias as sub_medias where is_file=false AND sub_medias.media_id = medias.id LIMIT 1) as medias FROM medias where media_id=${lastId} AND is_file=false`);
        res.json({
            folders: asideFolders,
            id: id
        });
    },
    trash: async (req, res, next) => {
        try {
            let listMedias = [];
            let mediaIds = [];
            const { page, isJson } = req.query;
            const limit = 15;
            const offset = page && page > 1 ? (page - 1) * limit : 0;
            let files = []; folders = [];
            try {
                files = await Media.findAndCountAll({
                    where: {
                        delete_at: {
                            [Op.not]: null
                        },
                        is_file: true
                    },
                    order: [
                        ["id", "DESC"]
                    ],
                    paranoid: false,
                    limit,
                    offset
                });
            } catch (e) {
                return res.redirect('/404');
            }
            if (isJson) {
                return res.json(files);
            }
            try {
                folders = await Media.findAndCountAll({
                    where: {
                        delete_at: {
                            [Op.not]: null
                        },
                        is_file: false,
                    },
                    paranoid: false,
                })
            } catch (e) {
                return res.redirect('/404');
            }
            let asideFolders = [];
            res.render('media/index', {
                layout: "layouts/media"
                , folders, files, req, listMedias, asideFolders, recursiveHTMLFolder, mediaIds, trash: 1
            })
        } catch (e) {
            next(e);
        }
    },
    restore: async (req, res) => {
        const { ids, restore } = req.body;
        if (!Array.isArray(ids) || !ids.length) {
            return res.json({
                status: 100,
                message: "Vui lòng chọn tệp tin!"
            })
        }
        try {
            await Cache.set(CACHE_CLEAR_CACHE_ASIDE_FOLDER, true);
            await Media.restore({
                where: {
                    id: {
                        [Op.in]: ids
                    }
                }
            })

            res.json({
                status: 200,
                message: "Khôi phục thành công"
            })
        } catch (e) {
            res.json({
                status: 100,
                message: "Xóa không thành công"
            })
        }
    },
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            await Media.destroy({
                where: {
                    id
                }
            })
            await Cache.set(CACHE_CLEAR_CACHE_ASIDE_FOLDER, true)
            res.json({
                status: 200,
                message: "Xóa thành công!"
            })
        } catch (e) {
            res.json({
                status: 100,
                message: "Xóa không thành công"
            })
        }
    },
    deleteAll: async (req, res) => {
        const { ids } = req.body;
        if (!Array.isArray(ids) || !ids.length) {
            return res.json({
                status: 100,
                message: "Vui lòng chọn tệp tin!"
            })
        }
        try {
            await Cache.set(CACHE_CLEAR_CACHE_ASIDE_FOLDER, true)
            await Media.destroy({
                where: {
                    id: {
                        [Op.in]: ids
                    }
                }
            })
            res.json({
                status: 200,
                message: "Xóa thành công!"
            })
        } catch (e) {
            res.json({
                status: 100,
                message: "Xóa không thành công"
            })
        }
    },
    deleteForce: async (req, res) => {
        const { ids } = req.body;
        if (!Array.isArray(ids) || !ids.length) {
            return res.json({
                status: 100,
                message: "Vui lòng chọn tệp tin!"
            })
        }
        let medias = [];
        try {
            medias = await Media.findAll({
                where: {
                    id: {
                        [Op.in]: ids
                    },
                },
                paranoid: false
            })
        } catch (e) {
            return res.redirect('/404');
        }

        Array.from(medias).forEach(media => {
            const custom = media.customs ? JSON.parse(media.customs) : [];
            if (custom && custom.pathAbsolute && fs.existsSync(process.cwd() + '/public/' + custom.pathAbsolute)) {
                fs.rmSync(process.cwd() + '/public/' + custom.pathAbsolute, { recursive: true, force: true });
            } else if (fs.existsSync(process.cwd() + '/public/' + media.path_absolute)) {
                fs.rmSync(process.cwd() + '/public/' + media.path_absolute, { recursive: true, force: true });
            }
        })
        try {
            await Media.destroy({
                where: {
                    id: {
                        [Op.in]: ids
                    }
                },
                force: true
            })
            res.json({
                status: 200,
                message: "Xóa thành công!"
            })
        } catch (e) {
            res.json({
                status: 100,
                message: "Xóa không thành công"
            })
        }
    },
    editFile: async (req, res) => {
        const body = req.body;
        const { id } = req.params;
        let file;
        try {
            file = await Media.findByPk(id);
        } catch (e) {
            return res.redirect('/404');
        }
        let newData = {};
        if (body.changeImage === "new") {
            const fileNew = body.base64Image;
            let media_id = body.media_id;
            delete body.path_absolute
            delete body.changeImage
            delete body.base64Image
            if (media_id && media_id.indexOf('/') === 0) {
                media_id = media_id.slice(1);
            }

            if (media_id && media_id.lastIndexOf('/') === media_id.length - 1) {
                media_id = media_id.slice(-1);
            }
            let pathStarts = [];
            let listMediaParent = [];
            if (media_id && media_id.length) {
                try {
                    listMediaParent = await Media.findAll({
                        where: {
                            id: {
                                [Op.in]: media_id.split('/')
                            },
                        },
                        order: [
                            ["id", "ASC"]
                        ]
                    })
                } catch (e) {
                    return res.redirect('/404');
                }
                pathStarts = Array.from(listMediaParent);
            }
            pathStarts.push({
                filename: 'resize'
            })
            let pathAbsolute = pathStarts;
            let filename = file.path.slice(0, file.path.lastIndexOf('.'));
            const dataFolder = createFolder(pathAbsolute, IS_NOT_ADD);
            var filePath = dataFolder.fullPath + '/' + filename + "." + file.extension;
            let number = 2;
            let flagName = true;
            /** Kiểm tra file đã tồn tại thì tạo file khác nhưng ảnh lưu tên khác */
            while (fs.existsSync(filePath)) {
                const newFileName = filename + '-' + number + '.' + file.extension;
                flagName = false;
                filePath = dataFolder.fullPath + '/' + newFileName;
                number++;
            }
            try {
                let hasOldResize = false;
                const customs = JSON.parse(file.customs);
                if (customs.pathAbsoluteOriginal && fs.existsSync(process.cwd() + '/public/' + customs.pathAbsolute)) {
                    fs.rmSync(process.cwd() + '/public/' + customs.pathAbsolute, { recursive: true, force: true });
                    hasOldResize = true;
                }
                const ext = fileNew.substring(fileNew.indexOf("/") + 1, fileNew.indexOf(";base64"));
                const fileType = fileNew.substring("data:".length, fileNew.indexOf("/"));
                const regex = new RegExp(`^data:${fileType}\/${ext};base64,`, 'gi');
                const base64Data = fileNew.replace(regex, "");

                fs.writeFileSync(filePath, base64Data, "base64");
                if (!flagName) {
                    filename = filename + '-' + (number - 1);
                }
                const path = filename + "." + file.extension;
                const path_absolute = dataFolder.pathAbsolute + '/' + path;

                if (!hasOldResize) {
                    customs.pathAbsoluteOriginal = file.path_absolute;
                    customs.pathOriginal = customs.path;
                }
                customs.path = path;
                customs.pathAbsolute = path_absolute;
                file.customs = JSON.stringify(customs);
                media_id = file.dataValues.media_id
                newData = { ...file.dataValues, ...body, media_id, path_absolute, path, updated_at: new Date() };
            } catch (e) {
                return res.json({
                    status: 100,
                    message: e.message
                })
            }
        } else if (body.changeImage === "original") {
            const customs = JSON.parse(file.customs);
            if (customs.pathAbsoluteOriginal && fs.existsSync(process.cwd() + '/public/' + customs.pathAbsolute)) {
                fs.rmSync(process.cwd() + '/public/' + customs.pathAbsolute, { recursive: true, force: true });
            }
            delete body.changeImage;
            const path_absolute = customs.pathAbsoluteOriginal;
            const path = customs.pathOriginal;
            customs.path = path;
            customs.pathAbsolute = path_absolute;
            delete customs.pathOriginal;
            delete customs.pathAbsoluteOriginal;

            file.customs = JSON.stringify(customs);
            const media_id = file.dataValues.media_id

            newData = { ...file.dataValues, ...body, media_id, path_absolute, path, updated_at: new Date() };
        } else {
            delete body.path_absolute;
            delete body.changeImage;
            const media_id = file.dataValues.media_id
            newData = { ...file.dataValues, ...body, media_id, updated_at: new Date() };
        }
        try {
            for (let key in newData) {
                if (newData[key] === '') {
                    newData[key] = null
                }
            }
            try {
                await Media.update(newData, {
                    where: {
                        id: id
                    }
                })
            } catch (e) {
                return res.redirect("/404");
            }
            return res.json({
                status: 200,
                data: newData,
                message: 'Cập nhật ảnh mới thành công'
            })
        } catch (e) {
            return res.json({
                status: 100,
                message: e.message
            })
        }
    }
}