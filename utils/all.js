const Index = require('@models/index')
const { resolve } = require('path')
module.exports = {
    toKebabCase: (str) => {
        // Bảng chuyển đổi các ký tự đặc biệt sang dấu gạch ngang
        const specialCharMap = {
            a: 'áàảãạăắằẳẵặâấầẩẫậ',
            e: 'éèẻẽẹêếềểễệ',
            i: 'íìỉĩị',
            o: 'óòỏõọôốồổỗộơớờởỡợ',
            u: 'úùủũụưứừửữự',
            y: 'ýỳỷỹỵ',
            d: 'đ',
        }

        // Chuyển đổi sang chữ thường
        str = str.toLowerCase()

        // Thay thế các ký tự đặc biệt bằng dấu gạch ngang
        for (const char in specialCharMap) {
            const regex = new RegExp(`[${specialCharMap[char]}]`, 'g')
            str = str.replace(regex, char)
        }

        // Thay thế khoảng trắng và các ký tự không mong muốn bằng dấu gạch ngang
        return str.replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
    },
    toSnakeCase: (str) => {
        // Bảng chuyển đổi các ký tự đặc biệt sang dấu gạch ngang
        const specialCharMap = {
            a: 'áàảãạăắằẳẵặâấầẩẫậ',
            e: 'éèẻẽẹêếềểễệ',
            i: 'íìỉĩị',
            o: 'óòỏõọôốồổỗộơớờởỡợ',
            u: 'úùủũụưứừửữự',
            y: 'ýỳỷỹỵ',
            d: 'đ',
        }

        // Chuyển đổi sang chữ thường
        str = str.toLowerCase()

        // Thay thế các ký tự đặc biệt bằng dấu gạch ngang
        for (const char in specialCharMap) {
            const regex = new RegExp(`[${specialCharMap[char]}]`, 'g')
            str = str.replace(regex, char)
        }

        // Thay thế khoảng trắng và các ký tự không mong muốn bằng dấu gạch ngang
        return str.replace(/\s+/g, '_').replace(/[^\w\-]+/g, '')
    },
    recursiveHTMLFolder: (folders, idActives = [], path = '', level = 0) => {
        if (
            !Array.isArray(folders) ||
            (Array.isArray(folders) && folders.length === 0)
        ) {
            return '<ul><p>Chưa có thư mục nào!</p></ul>'
        }
        let output = '<ul>'
        let isChange = false
        folders.forEach((folder) => {
            if (level === 0) {
                path = ''
            }
            if (path === '') {
                path = folder.id
            } else if (!isChange) {
                isChange = true
                path += '/' + folder.id
            } else {
                path = path.slice(0, path.lastIndexOf('/')) + ('/' + folder.id)
            }
            output += `<li data-id="${folder.id}">`
            output += `<a href="/admin/medias/${path}" class="${
                idActives.length
                    ? +idActives[idActives.length - 1] === folder.id
                        ? 'active'
                        : ''
                    : ''
            }">`
            if (folder.children && folder.children.length) {
                output += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z" />
                </svg>`
            }
            output += `<img src="/images/admin/folder.svg" alt="${folder.filename}">`
            output += `<span>${folder.filename}</span>`
            output += `</a>`
            if (
                folder.children &&
                folder.children.length &&
                folder.children.some((folderChild) =>
                    idActives.some((id) => +id === +folderChild.id)
                )
            ) {
                level++
                output += module.exports.recursiveHTMLFolder(
                    folder.children,
                    idActives,
                    path,
                    level
                )
            }
            output += `</li>`
        })
        output += '</ul>'
        return output
    },
    recursiveFolderChild: (folders, folder) => {
        folders.forEach((folderNew) => {
            if (!folderNew.children) {
                folderNew.children = []
            }
            if (folder.media_id === folderNew.id) {
                folderNew.children.push(folder)
            } else {
                module.exports.recursiveFolderChild(folderNew.children, folder)
            }
        })
    },
    recursiveFolder: (folders) => {
        let newAsideFolders = []
        Array.from(folders).forEach((folder) => {
            const newFolder = { ...folder.dataValues }
            if (folder.media_id === null) {
                newFolder.children = []
                newAsideFolders.push(newFolder)
            } else {
                newAsideFolders.forEach((folderNew) => {
                    if (folder.media_id === folderNew.id) {
                        folderNew.children.push(newFolder)
                    } else if (folderNew.children) {
                        module.exports.recursiveFolderChild(
                            folderNew.children,
                            newFolder
                        )
                    }
                })
            }
        })
        return newAsideFolders
    },
    checkLinkExist: async (params) => {
        const { value, id } = params
        const linkData = await Index.Link.findOne({
            where: {
                url: value,
            },
        })
        // Cần kiểm tra để check xem có tồn tại không
        if (!linkData || +id === +linkData.model_id) {
            return {
                status: 200,
                data: value,
            }
        }

        return {
            status: 100,
            message: 'Đã được sử dụng!',
            data: '',
        }
    },
    pathPlugin: (plugin, folder, pathname) => {
        return resolve(
            process.cwd(),
            `platform/plugins`,
            plugin,
            folder,
            pathname
        )
    },
    isObject:(value)=>{
        return value && typeof value === 'object' && value.constructor === Object;
    },
    isNullish:(data) => {
        return data === null || data === undefined;
    }
}
