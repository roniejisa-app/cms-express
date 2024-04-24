const multer = require('multer');
const { toKebabCase } = require('./all');
const fs = require('fs');
module.exports = {
    upload: multer(),
    createFolder: function (pathAbsolute, isAdd = true) {
        var name;
        var kebabName;
        var mediaId;
        var pathBeforeChange;
        var fullPath = process.cwd() + process.env.FOLDER_UPLOAD_SERVER;
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath);
        }
        for (var i = 0; i < pathAbsolute.length; i++) {
            name = pathAbsolute[i].filename;
            if (i < pathAbsolute.length - 1 && isAdd) {
                mediaId = pathAbsolute[i].id;
            }
            if (!isAdd) {
                mediaId = pathAbsolute[i].id;
            }
            kebabName = toKebabCase(name);
            pathBeforeChange = ('/' + kebabName);
            fullPath += ('/' + kebabName);

            // try {
            /**
             * Nếu các thư mục lúc đầu không phải thư mục cuối cùng thì chỉ kiểm tra tồn tại thì bỏ qua luôn
             */
            if (fs.existsSync(fullPath) && i < pathAbsolute.length - 1 && isAdd) {
                continue;
            } else if (!isAdd && fs.existsSync(fullPath)) {
                continue;
            }

            var number = 2;
            var flagName = true;
            while (fs.existsSync(fullPath)) {
                const pathNew = kebabName + '-' + number;
                fullPath = fullPath.replace(pathBeforeChange, '') + '/' + pathNew;
                pathBeforeChange = '/' + pathNew;
                flagName = false;
                number++;
            }

            if (!flagName) {
                kebabName += `-${number - 1}`;
            }

            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath);
            }

            folderUpload = fullPath;
            // } catch (e) {
            //     return {
            //         status: false
            //     };
            // }
        }
        return {
            status: true,
            fullPath: fullPath,
            pathAbsolute: fullPath.replace(process.cwd() + '/public/', ''),
            path: kebabName,
            name: name,
            mediaId
        };
    },
    /**
     * 
     * @param {*} pathAbsolute - Không có thông tin từ tệp gốc vì trong fullPath đã có sẵn
     */
    createFolderFromString: (pathAbsolute) => {
        pathAbsolute = pathAbsolute.split('/');
        let kebabName;
        let pathBeforeChange;
        let name;
        let fullPath = process.cwd() + process.env.FOLDER_UPLOAD_SERVER;
        for (let i = 0; i < pathAbsolute.length; i++) {
            name = pathAbsolute[i];
            kebabName = toKebabCase(name);
            pathBeforeChange = ('/' + kebabName);
            fullPath += ('/' + kebabName);

            // try {
            /**
             * Nếu các thư mục lúc đầu không phải thư mục cuối cùng thì chỉ kiểm tra tồn tại thì bỏ qua luôn
             */
            if (fs.existsSync(fullPath)) {
                continue;
            }

            var number = 2;
            var flagName = true;
            while (fs.existsSync(fullPath)) {
                const pathNew = kebabName + '-' + number;
                fullPath = fullPath.replace(pathBeforeChange, '') + '/' + pathNew;
                pathBeforeChange = '/' + pathNew;
                flagName = false;
                number++;
            }

            if (!flagName) {
                kebabName += `-${number - 1}`;
            }

            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath);
            }

            folderUpload = fullPath;
            // } catch (e) {
            //     return {
            //         status: false
            //     };
            // }
        }
    }
};