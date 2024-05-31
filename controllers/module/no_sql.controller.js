const ejs = require('ejs')
const bcrypt = require('bcrypt')
const {
    FIELD_TYPE_SELECT_ASSOC,
    FIELD_TYPE_INTEGER,
    FIELD_TYPE_PERMISSION,
    FIELD_TYPE_SLUG,
    ARRAY_TYPE_HAS_MULTIPLE,
    IS_NOT_ADD,
} = require('@constants/module')
const { convertDataFilterMongoDB } = require('@utils/filter')
const { initPaginate } = require('@utils/paginate')
const event = require('@utils/event')
const { checkLinkExist, isNullish } = require('@utils/all')
const DB = require('@models/index')

module.exports = {
    index: async (req, res, params) => {
        const { module, name, name_show, fields, modelMain, allFields } = params
        const model = new modelMain()
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
        const filters = convertDataFilterMongoDB(req.query, fields)
        const order = {
            _id: 1,
        }
        try {
            const [count, listData] = await Promise.all(
                [
                    model.DB.find(filters).count('_id'),
                    model.DB.find(filters)
                        .limit(limit)
                        .skip(offset)
                        .sort(order),
                ].map((data) => data)
            )
            let paginate = initPaginate(count, limit, page, module)
            req.success = req.flash('success')
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
            res.status(404).send('<h1>' + e.parent + '</h1>')
        }
    },
    store: async (req, res, params) => {
        const { module, name_show, modelMain, fields, body } = params
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

            // Xử lý trường hợp '' chỉ kiểm khác nullish trong trường hợp này không kiểm tra falsy
            if (!isNullish(body[fields[i].name])) {
                body[fields[i].name] = body[fields[i].name]
                    ? body[fields[i].name]
                    : null
            }
        }
        const model = new modelMain()
        const item = await model.DB.create(body)
        // Xử lý phần quan hệ khi thêm
        for (let i = 0; i < fields.length; i++) {
            if (ARRAY_TYPE_HAS_MULTIPLE.includes(fields[i].type)) {
                await fields[i].addOrEditAssociate(
                    item,
                    DB[fields[i].modelName],
                    fields[i].dataForm
                )
            }
            if (fields[i].dataPermission?.length) {
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
                const checkLink = await checkLinkExist({
                    value: body[fields[i].name],
                })

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
    },
    edit: async (req, res, params) => {
        const { module, name_show, modelMain, fields, id } = params
        const model = new modelMain()
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
                    as: fields[i].name,
                })
            }
            if (fields[i].type === FIELD_TYPE_PERMISSION) {
                include = fields[i].include(
                    DB[fields[i].modelRoleModulePermission],
                    DB[fields[i].modelModulePermission]
                )
            }
        }
        const data = await model.DB.findOne({
            _id: id,
        }).exec()
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
        const model = new modelMain()
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

        await model.DB.updateOne(
            {
                _id: id,
            },
            {
                ...body,
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

        event.emit('update', req, module, id, body)
        req.flash('success', `Sửa ${name_show} thành công!`)
        res.redirect(`/admin/${module}/edit/${id}`)
    },
    destroy: async (req, res, params) => {
        const { module, name_show, modelMain, id, fields } = params
        //Chỗ này sẽ xóa toàn bộ mọi thứ liên quan không để lại cái gì!!!
        const model = new modelMain()

        await model.DB.deleteOne({
            _id: id,
        })
        req.flash('success', `Xóa ${name_show} thành công`)
        event.emit('delete', req, module, id)
        res.redirect(`/admin/${module}`)
    },
    destroyMulti: async (req, res, params) => {
        const { module, name_show, modelMain, fields } = params
        const model = new modelMain()
        const { ids } = req.body
        //Chỗ này sẽ xóa toàn bộ mọi thứ liên quan không để lại cái gì!!!

        await model.DB.deleteMany({
            _id: { $in: ids },
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
        const model = new modelMain()
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
        let order = {
            _id: 1,
        }
        const offset = (page - 1) * limit
        console.log(req.body)
        const filters = convertDataFilterMongoDB(req.body, fields)
        if (sort) {
            order = {}
            order[sort === 'id' ? '_id' : sort] = sortType
        }
        const [count, listData] = await Promise.all(
            [
                model.DB.find(filters).count('_id'),
                model.DB.find(filters).limit(limit).skip(offset).sort(order),
            ].map((data) => data)
        )

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
            data: listData,
            html,
        })
    },
}
