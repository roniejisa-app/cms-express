const IS_FORM = true
const IS_NOT_VIEW = false
const { dataModule } = require('@utils/dataTable')
// Cần phân loại được nếu là mongodb
const SQLController = require('./module/sql.controller')
const NoSqlController = require('./module/no_sql.controller')
const controllers = {
    SQL: {
        index: (req, res, params) => SQLController.index(req, res, params),
        store: (req, res, params) => SQLController.store(req, res, params),
        edit: (req, res, params) => SQLController.edit(req, res, params),
        update: (req, res, params) => SQLController.update(req, res, params),
        destroy: (req, res, params) => SQLController.destroy(req, res, params),
        destroyMulti: (req, res, params) =>
            SQLController.destroyMulti(req, res, params),
        filter: (req, res, params) => SQLController.filter(req, res, params),
        exampleExcel: (req, res, params) =>
            SQLController.exampleExcel(req, res, params),
        downloadExcel: (req, res, params) =>
            SQLController.downloadExcel(req, res, params),
        storeExcel: (req, res, params) =>
            SQLController.storeExcel(req, res, params),
    },
    NOSQL: {
        index: (req, res, params) => NoSqlController.index(req, res, params),
        store: (req, res, params) => NoSqlController.store(req, res, params),
        edit: (req, res, params) => NoSqlController.edit(req, res, params),
        update: (req, res, params) => NoSqlController.update(req, res, params),
        destroy: (req, res, params) =>
            NoSqlController.destroy(req, res, params),
        destroyMulti: (req, res, params) =>
            NoSqlController.destroyMulti(req, res, params),
        filter: (req, res, params) => NoSqlController.filter(req, res, params),
    },
}
module.exports = {
    index: async (req, res) => {
        // Đầu tiên cần lấy ra loại đã sau đó redirect sang controller mongodb
        const { type, ...params } = await dataModule(req)
        // Fix bug ở đây
        return controllers[type.toUpperCase()].index(req, res, params)
    },
    filter: async (req, res) => {
        const { type, ...params } = await dataModule(req)
        return await controllers[type.toUpperCase()].filter(req, res, params)
    },
    /**
     *
     * @param {*} req
     * @param {*} res
     * @returns
     *
     * Hàm này không thay đổi vì dữ liệu chỉ cần lấy ra loại của cột
     */
    add: async (req, res) => {
        const { model, module, name, name_show, fields, id } = await dataModule(
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

        console.log(
            res.render('admin/add', {
                model,
                module,
                name,
                name_show,
                fields,
                id,
                leftFields,
                rightFields,
                req,
                csrfToken: req.csrfToken(),
            })
        )
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
            csrfToken: req.csrfToken(),
        })
    },
    handleAdd: async (req, res) => {
        const { modelMain, type, ...params } = await dataModule(
            req,
            IS_NOT_VIEW
        )
        const body = await req.validate(req.body, modelMain.validate())
        if (body) {
            return controllers[type.toUpperCase()].store(req, res, {
                ...params,
                body,
                modelMain,
            })
        } else {
            return res.redirect(process.env.VITE_AP+`/${params.module}/add`)
        }
    },
    edit: async (req, res) => {
        const { type, ...params } = await dataModule(req, IS_NOT_VIEW, IS_FORM)
        return controllers[type.toUpperCase()].edit(req, res, {
            ...params,
        })
    },
    handleUpdate: async (req, res) => {
        const { modelMain, type, ...params } = await dataModule(
            req,
            IS_NOT_VIEW
        )
        const body = await req.validate(req.body, modelMain.validate(params.id))
        if (body) {
            return controllers[type.toUpperCase()].update(req, res, {
                ...params,
                modelMain,
                body,
            })
        } else {
            res.redirect(process.env.VITE_AP+`/${params.module}/edit/${params.id}`)
        }
    },
    handleDelete: async (req, res) => {
        const { type, ...params } = await dataModule(req, IS_NOT_VIEW)
        return controllers[type.toUpperCase()].destroy(req, res, params)
    },
    handleDeleteMulti: async (req, res) => {
        const { type, ...params } = await dataModule(req, IS_NOT_VIEW)
        return controllers[type.toUpperCase()].destroyMulti(req, res, params)
    },
    exampleExcel: async (req, res) => {
        const { type, ...params } = await dataModule(req)
        return controllers[type.toUpperCase()].exampleExcel(req, res, params)
    },
    downloadExcel: async (req, res) => {
        const { type, ...params } = await dataModule(req)
        return controllers[type.toUpperCase()].downloadExcel(req, res, params)
    },
    storeExcel: async (req, res) => {
        const { type, ...params } = await dataModule(req)
        return controllers[type.toUpperCase()].storeExcel(req, res, params)
    },
}
