const bcrypt = require('bcrypt')
const { Op } = require('sequelize')
const ejs = require('ejs')
const { convertDataFilter } = require('@utils/filter')
const { initPaginate } = require('@utils/paginate')
const {
    FIELD_TYPE_SELECT_ASSOC,
    FIELD_TYPE_INTEGER,
    FIELD_TYPE_PERMISSION,
    FIELD_TYPE_SLUG,
    ARRAY_TYPE_HAS_MULTIPLE,
    ARRAY_TYPE_HAS_DATA,
    IS_NOT_ADD,
} = require('@constants/module')
const { checkLinkExist } = require('@utils/all')
const event = require('@utils/event')
const DB = require('@models/index')
const ExcelJS = require('exceljs')

module.exports = {
    index: async (req, res, params) => {
        const { module, name, name_show, fields, modelMain, allFields } = params
        let { page, sort, limit } = req.query
        fields.sort((a, b) => {
            if (!a.order) {
                a.order = 99
            }
            if (!b.order) {
                b.order = 99
            }
            return +a.order - +b.order
        })
        // Thêm edge loading
        let include = []
        for (let i = 0; i < fields.length; i++) {
            if (
                fields[i].include &&
                Array.isArray(fields[i].include) &&
                fields[i].show
            ) {
                include = [
                    ...include,
                    ...fields[i].include.map(({ model, as }) => ({
                        model: DB[model],
                        as,
                    })),
                ]
            }
        }
        // FilterFields
        const filterFields = allFields.filter(({ filter }) => filter)
        const filterDefault = allFields.find(
            ({ filterDefault }) => filterDefault
        )
        // Filter
        if (!limit) {
            limit = 10
        }
        if (!page) {
            page = 1
        }
        const offset = (page - 1) * limit
        const filters = convertDataFilter(req.query, fields)

        const order = [['id', 'ASC']]
        req.success = req.flash('success')
        req.error = req.flash('error')
        try {
            const { count, rows: listData } = await modelMain.findAndCountAll({
                where: filters,
                include,
                order,
                limit,
                offset,
            })

            let paginate = initPaginate(count, limit, page).replaceAll(
                process.env.PAGINATE_HASH,
                module
            )
            return res.render('admin/view', {
                req,
                fields,
                module,
                listData,
                name,
                name_show,
                paginate,
                filterFields,
                filterDefault,
                csrfToken: req.csrfToken(),
            })
        } catch (e) {
            res.status(404).send('<h1>' + e.message + '</h1>')
        }
    },
    store: async (req, res, params) => {
        const { module, name_show, modelMain, fields, body } = params
        if (body) {
            // Chỉnh sửa đầu vào của dữ liệu
            for (let i = 0; i < fields.length; i++) {
                if (fields[i].hash) {
                    const saltRounds = await bcrypt.genSalt(12)
                    const passwordBcrypt = await bcrypt.hash(
                        body[fields[i].name],
                        saltRounds
                    )
                    body[fields[i].name] = passwordBcrypt
                }
                if (ARRAY_TYPE_HAS_MULTIPLE.includes(fields[i].type)) {
                    fields[i].dataForm = Array.isArray(body[fields[i].name])
                        ? body[fields[i].name]
                        : [body[fields[i].name]]
                    delete body[fields[i].name]
                }
                if (fields[i].dataType === FIELD_TYPE_INTEGER) {
                    body[fields[i].name] = +body[fields[i].name]
                }

                if (fields[i].type === FIELD_TYPE_SELECT_ASSOC) {
                }
                // Xử lý permission
                if (fields[i].type === FIELD_TYPE_PERMISSION) {
                    if (body[fields[i].name]) {
                        fields[i].dataPermission = Array.isArray(
                            body[fields[i].name]
                        )
                            ? body[fields[i].name]
                            : [body[fields[i].name]]
                        delete body[fields[i].name]
                    }
                }

                // Xử lý trường hợp ''
                if (
                    body[fields[i].name] != null ||
                    body[fields[i].name] != undefined
                ) {
                    body[fields[i].name] = body[fields[i].name]
                        ? body[fields[i].name]
                        : null
                }
            }
            const item = await modelMain.create(body)
            // Xử lý phần quan hệ khi thêm
            for (let i = 0; i < fields.length; i++) {
                if (ARRAY_TYPE_HAS_MULTIPLE.includes(fields[i].type)) {
                    await fields[i].addOrEditAssociate(
                        item,
                        DB[fields[i].modelName],
                        fields[i].dataForm
                    )
                }
                if (
                    fields[i].dataPermission &&
                    fields[i].dataPermission.length
                ) {
                    await fields[i].addOrEditPermission(
                        item,
                        DB[fields[i].modelModulePermission],
                        fields[i].dataPermission,
                        fields[i].mainKey,
                        fields[i].subKey,
                        fields[i].fn
                    )
                }

                if (fields[i].type === FIELD_TYPE_SLUG) {
                    const checkLink = await checkLinkExist(
                        DB['Link'],
                        body[fields[i].name]
                    )
                    if (checkLink.status === 200) {
                        fields[i].slugData(
                            item.id,
                            body[fields[i].name],
                            DB[fields[i].slugDB]
                        )
                    }
                }
            }
            req.flash('success', `Thêm ${name_show} thành công!`)
            event.emit('create', req, module, item, body)
            return res.redirect(`/admin/${module}`)
        } else {
            return res.redirect(`/admin/${module}/add`)
        }
    },
    edit: async (req, res, params) => {
        const { module, name_show, modelMain, fields, id } = params
        const leftFields = fields
            .filter((field) => !field.positionSidebar)
            .sort((a, b) => {
                if (!a.order) {
                    a.order = 99
                }
                if (!b.order) {
                    b.order = 99
                }
                return +a.order - +b.order
            })
        const rightFields = fields
            .filter((field) => field.positionSidebar)
            .sort((a, b) => {
                if (!a.order) {
                    a.order = 99
                }
                if (!b.order) {
                    b.order = 99
                }
                return +a.order - +b.order
            })
        let include = []
        for (let i = 0; i < fields.length; i++) {
            if (ARRAY_TYPE_HAS_MULTIPLE.includes(fields[i].type)) {
                include.push({
                    model: DB[fields[i].modelName],
                    as: fields[i].modelAs,
                })
            }
            if (fields[i].type === FIELD_TYPE_PERMISSION) {
                include = fields[i].include(
                    DB[fields[i].modelRoleModulePermission],
                    DB[fields[i].modelModulePermission]
                )
            }
        }
        const data = await modelMain.findOne({
            where: {
                id,
            },
            include,
        })

        req.success = req.flash('success')
        return res.render('admin/edit', {
            layout: 'layouts/admin',
            req,
            data,
            module,
            name_show,
            modelMain,
            id,
            leftFields,
            rightFields,
            csrfToken: req.csrfToken(),
        })
    },
    update: async (req, res, params) => {
        const { module, name_show, modelMain, id, fields, body } = params
        // Chỉnh sửa đầu vào của dữ liệu
        for (let i = 0; i < fields.length; i++) {
            if (fields[i].hash) {
                if (body[fields[i].name] !== '') {
                    const saltRounds = await bcrypt.genSalt(12)
                    const passwordBcrypt = await bcrypt.hash(
                        body[fields[i].name],
                        saltRounds
                    )
                    body[fields[i].name] = passwordBcrypt
                } else {
                    delete body[fields[i].name]
                }
            }
            if (ARRAY_TYPE_HAS_MULTIPLE.includes(fields[i].type)) {
                fields[i].dataForm = Array.isArray(body[fields[i].name])
                    ? body[fields[i].name]
                    : [body[fields[i].name]]
                delete body[fields[i].name]
            }
            if (fields[i].dataType === FIELD_TYPE_INTEGER) {
                body[fields[i].name] = +body[fields[i].name]
            }
            // Xử lý permission
            if (fields[i].type === FIELD_TYPE_PERMISSION) {
                fields[i].dataPermission = Array.isArray(body[fields[i].name])
                    ? body[fields[i].name]
                    : [body[fields[i].name]]
                delete body[fields[i].name]
            }

            // Xử lý trường hợp ''
            if (
                body[fields[i].name] != null ||
                body[fields[i].name] != undefined
            ) {
                body[fields[i].name] = body[fields[i].name]
                    ? body[fields[i].name]
                    : null
            }
        }

        await modelMain.update(
            {
                ...body,
            },
            {
                where: {
                    id,
                },
            }
        )

        for (let i = 0; i < fields.length; i++) {
            if (ARRAY_TYPE_HAS_MULTIPLE.includes(fields[i].type)) {
                const item = await modelMain.findByPk(id)
                await fields[i].addOrEditAssociate(
                    item,
                    DB[fields[i].modelName],
                    fields[i].dataForm,
                    IS_NOT_ADD
                )
            }

            if (fields[i].dataPermission && fields[i].dataPermission.length) {
                const item = await modelMain.findByPk(id)
                await fields[i].addOrEditPermission(
                    item,
                    DB[fields[i].modelModulePermission],
                    fields[i].dataPermission,
                    fields[i].mainKey,
                    fields[i].subKey,
                    fields[i].fn,
                    IS_NOT_ADD
                )
            }
        }

        req.flash('success', `Sửa ${name_show} thành công!`)
        event.emit('update', req, module, id, body)
        res.redirect(`/admin/${module}/edit/${id}`)
    },
    destroy: async (req, res, params) => {
        const { module, name_show, modelMain, id, fields, model } = params
        //Chỗ này sẽ xóa toàn bộ mọi thứ liên quan không để lại cái gì!!!

        const canBeDeleted = await new Promise(async (resolve, reject) => {
            for (var i = 0; i < fields.length; i++) {
                if (
                    ARRAY_TYPE_HAS_DATA.includes(fields[i].type) &&
                    typeof fields[i].canBeDeleted === 'function'
                ) {
                    const checkHasDelete = await fields[i].canBeDeleted(DB, id)
                    if (!checkHasDelete) {
                        resolve(false)
                    }
                }
                if (i === fields.length - 1) {
                    resolve(true)
                }
            }
        })
        if (!canBeDeleted) {
            req.flash(
                'error',
                `Xóa ${name_show} không thành công, vui lòng tìm và xóa tất cả các dữ liệu liên quan trước`
            )
            return res.redirect(`/admin/${module}`)
        }
        for (let field of fields) {
            if (ARRAY_TYPE_HAS_MULTIPLE.includes(field.type)) {
                const item = await modelMain.findByPk(id)
                await field.addOrEditAssociate(
                    item,
                    DB[field.modelName],
                    [],
                    IS_NOT_ADD
                )
            }

            if (field.type === FIELD_TYPE_PERMISSION) {
                const item = await modelMain.findByPk(id)
                await field.addOrEditPermission(
                    item,
                    DB[field.modelName],
                    [],
                    field.mainKey,
                    field.subKey,
                    field.fn,
                    IS_NOT_ADD
                )
            }

            if (field.type === FIELD_TYPE_SLUG) {
                await DB['Link'].destroy({
                    where: {
                        model_id: id,
                        model: model.charAt(0).toUpperCase() + model.slice(1),
                    },
                })
            }
        }

        await modelMain.destroy({
            where: {
                id,
            },
        })

        event.emit('delete', req, module, id)
        req.flash('success', `Xóa ${name_show} thành công`)
        res.redirect(`/admin/${module}`)
    },
    destroyMulti: async (req, res, params) => {
        const { module, name_show, modelMain, fields } = params
        const { ids } = req.body
        //Chỗ này sẽ xóa toàn bộ mọi thứ liên quan không để lại cái gì!!!
        for (const id of ids) {
            for (var i = 0; i < fields.length; i++) {
                if (ARRAY_TYPE_HAS_MULTIPLE.includes(fields[i].type)) {
                    const item = await modelMain.findByPk(id)
                    await fields[i].addOrEditAssociate(
                        item,
                        DB[fields[i].modelName],
                        [],
                        IS_NOT_ADD
                    )
                }

                if (fields[i].type === FIELD_TYPE_PERMISSION) {
                    const item = await modelMain.findByPk(id)
                    await fields[i].addOrEditPermission(
                        item,
                        DB[fields[i].modelName],
                        [],
                        fields[i].mainKey,
                        fields[i].subKey,
                        fields[i].fn,
                        IS_NOT_ADD
                    )
                }
            }
        }
        await modelMain.destroy({
            where: {
                id: {
                    [Op.in]: ids,
                },
            },
        })
        req.flash('success', `Xóa ${name_show} thành công`)
        for (const id of ids) {
            event.emit('delete', req, module, id)
        }
        res.json({
            status: 200,
            message: 'Xóa thành công!',
        })
    },
    filter: async (req, res, params) => {
        const { module, name, fields, modelMain } = params

        fields.sort((a, b) => {
            if (!a.order) {
                a.order = 99
            }
            if (!b.order) {
                b.order = 99
            }
            return +a.order - +b.order
        })

        let { page, sort, sortType, limit } = req.body
        // Filter
        if (!limit) {
            limit = 1
        }
        if (!page) {
            page = 1
        }
        let order = [['id', 'ASC']]
        const offset = (page - 1) * limit
        const filters = convertDataFilter(req.body, fields)
        if (sort) {
            order = [[sort, sortType]]
        }
        // Thêm edge loading
        let include = []
        for (let i = 0; i < fields.length; i++) {
            if (
                fields[i].include &&
                Array.isArray(fields[i].include) &&
                fields[i].show
            ) {
                include = [
                    ...include,
                    ...fields[i].include.map(({ model, as }) => ({
                        model: DB[model],
                        as,
                    })),
                ]
            }
        }
        const { count, rows: listData } = await modelMain.findAndCountAll({
            where: filters,
            order,
            limit,
            offset,
            include,
        })
        let paginate = initPaginate(count, limit, page, module)
        const html = await ejs.renderFile(
            process.cwd() + '/views/admin/views/table.ejs',
            {
                req,
                fields,
                module,
                listData,
                name,
                paginate,
                csrfToken: req.csrfToken(),
            }
        )
        return res.json({
            status: 200,
            html,
        })
    },
    exampleExcel: async (req, res, params) => {
        const { fields, modelMain } = params

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'example.xlsx'
        )
        const workbook = new ExcelJS.Workbook()
        workbook.creator = req.user.fullname
        workbook.lastModifiedBy = req.user.fullname
        workbook.created = new Date()
        workbook.modified = new Date()
        workbook.lastPrinted = new Date()
        const worksheet = workbook.addWorksheet('Mẫu dữ liệu', {
            views: [{ state: 'frozen', ySplit: 2 }],
        })

        let excelHeaders = fields.reduce((initialArr, field) => {
            if (field.excel) {
                initialArr.push({
                    header: field.excel.label,
                    key: field.excel.key,
                    width: field.excel.width,
                    data: field.excel.data,
                    style: {
                        font: {
                            size: 14,
                        },
                    },
                })
            }
            return initialArr
        }, [])
        // Lấy ra thông tin các cột có thể thêm bằng excel
        excelHeaders = [
            {
                header: 'STT',
                key: 'id',
                data: 1,
                width: 10,
                style: {
                    ...excelHeaders[0].style,
                    alignment: {
                        vertical: 'middle',
                        horizontal: 'center',
                    },
                },
            },
            ...excelHeaders,
        ]
        worksheet.columns = excelHeaders
        // Cấu hình màu sắc cho cột đầu và cột 2
        worksheet.getRow(1).eachCell((cell, colNumber) => {
            cell.font = {
                size: 14,
                color: { argb: 'FFFFFFFF' }, // Màu chữ trắng
            }
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF006400' }, // Background màu xanh lá đậm (DarkGreen)
            }
        })
        const data = {}
        // Thêm dữ liệu mẫu
        excelHeaders.forEach((field) => {
            data[field.key] = field.data
        })
        worksheet.addRow(data)
        workbook.xlsx.write(res).then(function () {
            res.end()
        })
    },
    downloadExcel: async (req, res, params) => {
        const { fields, modelMain } = params

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'example.xlsx'
        )
        const workbook = new ExcelJS.Workbook()
        workbook.creator = req.user.fullname
        workbook.lastModifiedBy = req.user.fullname
        workbook.created = new Date()
        workbook.modified = new Date()
        workbook.lastPrinted = new Date()
        const worksheet = workbook.addWorksheet('Mẫu dữ liệu', {
            views: [{ state: 'frozen', ySplit: 2 }],
        })

        let excelHeaders = fields.reduce((initialArr, field) => {
            if (field.excel) {
                initialArr.push({
                    header: field.excel.label,
                    key: field.excel.key,
                    width: field.excel.width,
                    data: field.excel.data,
                    style: {
                        font: {
                            size: 14,
                        },
                    },
                })
            }
            return initialArr
        }, [])

        excelHeaders = [
            {
                header: 'ID',
                key: 'id',
                width: 10,
                data: 'STT',
                style: {
                    ...excelHeaders[0].style,
                    alignment: {
                        vertical: 'middle',
                        horizontal: 'center',
                    },
                },
            },
            ...excelHeaders,
        ]
        worksheet.columns = excelHeaders

        worksheet.getRow(1).eachCell((cell, colNumber) => {
            cell.font = {
                size: 14,
                color: { argb: 'FFFFFFFF' }, // Màu chữ trắng
            }
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF006400' }, // Background màu xanh lá đậm (DarkGreen)
            }
        })
        // In giá trị cột mẫu vào bảng
        let dataExample = {}
        excelHeaders.forEach((field) => {
            dataExample[field.key] = field.data
        })
        worksheet.addRow(dataExample)

        // Lấy dữ liệu của bảng
        const data = await modelMain.findAll({
            attributes: excelHeaders.map((field) => field.key),
        })
        // Để lấy dữ liệu mặc định cho hàng 2 trở đi
        data.forEach((dataColumn) => {
            const dataExcel = {}
            excelHeaders.forEach((column) => {
                dataExcel[column.key] = dataColumn[column.key]
            })
            worksheet.addRow(dataExcel)
        })

        workbook.xlsx.write(res).then(function () {
            res.end()
        })
    },
    storeExcel: async (req, res, params) => {
        const { fields, modelMain } = params
        const workbook = new ExcelJS.Workbook()
        // Lấy ra buffer để đọc
        await workbook.xlsx.load(req.file.buffer)
        // Lấy ra những trường được import
        let fieldExcels = fields.reduce((initialArr, field) => {
            if (field.excel) {
                initialArr.push(field.excel.key)
            }
            return initialArr
        }, [])
        fieldExcels = ['STT', ...fieldExcels]
        // Lấy ra từng bảng
        const data = []
        workbook.eachSheet((worksheet) => {
            // Lấy từng hàng bắt đầu từ cột số 2 bỏ qua cột số 1,2 vì là tên cột và dữ liệu từng cột
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 2) {
                    const item = {}
                    // Đặt dữ liệu cho mặc định
                    // Cấu trúc dữ liệu:
                    row.eachCell((cell, colNumber) => {
                        if (colNumber > 1) {
                            // Lưu giữ liệu theo đúng cột trong bảng
                            item[fieldExcels[colNumber - 1]] = cell.value
                        }
                    })
                    data.push(item)
                }
            })
        })
        const uploadData = await modelMain.bulkCreate(data)
        res.json({
            status: 200,
            data: uploadData,
            message: 'Đã nhập xong',
        })
    },
}
