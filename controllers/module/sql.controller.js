const { convertDataFilter } = require("../../utils/filter")
const { initPaginate } = require("../../utils/paginate")

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
}
