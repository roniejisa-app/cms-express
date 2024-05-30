const DB = require('../models/index')
const IS_FORM = true
const IS_NOT_ADD = false
const IS_NOT_VIEW = false
const typeHasMultiple = ['selectMultiAssoc']
const bcrypt = require('bcrypt')
const event = require('../utils/event')
const { initPaginate } = require('../utils/paginate')
const { convertDataFilter } = require('../utils/filter')
const ejs = require('ejs')
const { Op } = require('sequelize')
const { checkLinkExist } = require('../utils/all')
const { getData } = require('../utils/dataTable')
const {
    FIELD_TYPE_SELECT_ASSOC,
    FIELD_TYPE_INTEGER,
    FIELD_TYPE_PERMISSION,
    FIELD_TYPE_SLUG,
} = require('../contains/module')

module.exports = {
    index: async (req, res) => {
        const { module, name, name_show, fields, modelMain, allFields } =
            await getData(req)
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
        const filters = convertDataFilter(req.query, fields)

        const order = [['id', 'ASC']]
        try {
            const { count, rows: listData } = await modelMain.findAndCountAll({
                where: filters,
                order,
                limit,
                offset,
            })
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
            })
        } catch (e) {
            res.status(404).send('<h1>' + e.parent + '</h1>')
        }
    },
    filter: async (req, res) => {
        const { module, name, fields, modelMain } = await getData(req)

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
        const { count, rows: listData } = await modelMain.findAndCountAll({
            where: filters,
            order,
            limit,
            offset,
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
            }
        )
        res.json({
            status: 200,
            data: listData,
            html,
        })
    },
    add: async (req, res) => {
        const { model, module, name, name_show, fields, id } = await getData(
            req,
            IS_NOT_VIEW,
            IS_FORM
        )
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
        return res.render('admin/add', {
            model,
            module,
            name,
            name_show,
            fields,
            id,
            leftFields,
            rightFields,
            req,
        })
    },

    handleAdd: async (req, res) => {
        const { module, name_show, modelMain, fields } = await getData(
            req,
            IS_NOT_VIEW
        )
        const body = await req.validate(req.body, modelMain.validate())
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
                if (typeHasMultiple.includes(fields[i].type)) {
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
                if (typeHasMultiple.includes(fields[i].type)) {
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
            req.flash = req.flash('success', `Thêm ${name_show} thành công!`)
            event.emit('create', req, module, item, body)
            res.redirect(`/admin/${module}`)
            // } catch (e) {
            //     next(e);
            // }
        } else {
            res.redirect(`/admin/${module}/add`)
        }
    },
    edit: async (req, res) => {
        const { module, name_show, modelMain, fields, id } = await getData(
            req,
            IS_NOT_VIEW,
            IS_FORM
        )
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
            if (typeHasMultiple.includes(fields[i].type)) {
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
        const data = await modelMain.findOne({
            where: {
                id,
            },
            include,
        })

        req.success = req.flash('success')
        res.render('admin/edit', {
            layout: 'layouts/admin',
            req,
            data,
            module,
            name_show,
            modelMain,
            id,
            leftFields,
            rightFields,
        })
    },
    handleUpdate: async (req, res) => {
        const { module, model, name_show, modelMain, id, fields } =
            await getData(req, IS_NOT_VIEW)
        const body = await req.validate(req.body, modelMain.validate(id))
        if (body) {
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
                if (typeHasMultiple.includes(fields[i].type)) {
                    fields[i].dataForm = Array.isArray(body[fields[i].name])
                        ? body[fields[i].name]
                        : [body[fields[i].name]]
                    delete body[fields[i].name]
                }
                if (fields[i].dataType === FIELD_TYPE_INTEGER) {
                    body[fields[i].name] = +body[fields[i].name]
                }
                // Xử lý permission
                if (fields[i].type === FIELD_TYPE_INTEGER) {
                    fields[i].dataPermission = Array.isArray(
                        body[fields[i].name]
                    )
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
            // try {
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
                if (typeHasMultiple.includes(fields[i].type)) {
                    const item = await modelMain.findByPk(id)
                    await fields[i].addOrEditAssociate(
                        item,
                        DB[fields[i].modelName],
                        fields[i].dataForm,
                        IS_NOT_ADD
                    )
                }

                if (
                    fields[i].dataPermission &&
                    fields[i].dataPermission.length
                ) {
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
            res.redirect(`/admin/${module}/edit/${id}`)
            event.emit('update', req, module, id, body)
            // } catch (e) {
            //    res.redirect(`/admin/${module}/edit${id}`)
            // }
        } else {
            res.redirect(`/admin/${module}/edit/${id}`)
        }
    },
    handleDelete: async (req, res) => {
        const { module, name_show, modelMain, id, fields } = await getData(
            req,
            IS_NOT_VIEW
        )
        //Chỗ này sẽ xóa toàn bộ mọi thứ liên quan không để lại cái gì!!!
        for (var i = 0; i < fields.length; i++) {
            if (typeHasMultiple.includes(fields[i].type)) {
                const item = await modelMain.findByPk(id)
                await fields[i].addOrEditAssociate(
                    item,
                    DB[fields[i].modelName],
                    [],
                    IS_NOT_ADD
                )
            }

            if (fields[i].type === 'permissions') {
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
        await modelMain.destroy({
            where: {
                id,
            },
        })
        req.flash('success', `Xóa ${name_show} thành công`)
        event.emit('delete', req, module, id)
        res.redirect(`/admin/${module}`)
    },
    handleDeleteMulti: async (req, res) => {
        const { module, name_show, modelMain, fields } = await getData(
            req,
            IS_NOT_VIEW
        )
        const { ids } = req.body
        //Chỗ này sẽ xóa toàn bộ mọi thứ liên quan không để lại cái gì!!!
        for (const id of ids) {
            for (var i = 0; i < fields.length; i++) {
                if (typeHasMultiple.includes(fields[i].type)) {
                    const item = await modelMain.findByPk(id)
                    await fields[i].addOrEditAssociate(
                        item,
                        DB[fields[i].modelName],
                        [],
                        IS_NOT_ADD
                    )
                }

                if (fields[i].type === 'permissions') {
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
}
