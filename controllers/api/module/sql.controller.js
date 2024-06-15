const { REQUEST_API } = require('@constants/api')
const { convertDataFilter } = require('@utils/filter')
const event = require('@utils/event')

module.exports = {
    all: async (req, res, params) => {
        const { fields, modelMain } = params
        let { page, sort, limit } = req.query

        let queries = {}
        if (limit) {
            queries.limit = limit
            if (!page) {
                page = 1
            }
            queries.offset = (page - 1) * limit
        }

        if (page) {
            queries.page = page
        }

        const filters = convertDataFilter(req.query, fields)

        const order = [['id', 'ASC']]

        const response = await modelMain.findAndCountAll({
            attributes: ['id', ...fields.map((field) => field.name)],
            where: filters,
            order,
            ...queries,
        })

        res.status(200).json({
            status: 200,
            data: response,
            message: 'Success',
        })
    },
    one: async (req, res, params) => {
        const { fields, modelMain, id } = params

        const response = await modelMain.findOne({
            attributes: ['id', ...fields.map((field) => field.name)],
            where: {
                id,
            },
        })

        if (!response) {
            return res.status(404).json({
                errors: {
                    code: 404,
                    message: 'Dữ liệu không tồn tại!',
                },
            })
        }

        return res.status(200).json({
            status: 200,
            data: response,
            message: 'Success',
        })
    },
    create: async (req, res, params) => {
        const { modelMain, module } = params
        const body = await req.validate(
            req.body,
            modelMain.validate(),
            REQUEST_API
        )

        if (req.errors) {
            return res.status(400).json({
                errors: {
                    code: 400,
                    message: 'Thêm dữ liệu không thành công',
                    details: req.errors,
                },
            })
        }
        const data = await modelMain.create(body)
        event.emit('create', req, module, item, body)
        return res.status(200).json({
            status: 200,
            data: data,
            message: 'Success',
        })
    },
    update: async (req, res, params) => {
        const { fields, modelMain, id, module } = params

        const keyNotAvailable = Object.keys(req.body).filter(
            (key) => !fields.map(({ name }) => name).includes(key)
        )
        if (keyNotAvailable.length > 0) {
            return res.status(400).json({
                errors: {
                    code: 400,
                    message: 'Thay đổi dữ liệu không thành công',
                    details: keyNotAvailable.join(', ') + ' không tồn tại!',
                },
            })
        }

        const modelItem = await modelMain.findOne({
            where: {
                id,
            },
        })
        if (!modelItem) {
            return res.status(400).json({
                errors: {
                    code: 400,
                    message: 'Không tồn tại dữ liệu trong bảng!',
                    details: 'Không có dữ liệu trong bảng',
                },
            })
        }
        for (let [key, value] of Object.entries(req.body)) {
            modelItem[key] = value
        }

        await modelItem.save()
        event.emit('update', req, module, id, body)

        return res.status(200).json({
            status: 200,
            data: modelItem,
            message: 'Thay đổi dữ liệu thành công',
        })
    },
    delete: async (req, res, params) => {
        const { modelMain, id, module } = params

        const modelItem = await modelMain.destroy({
            where: {
                id,
            },
        })
        event.emit('delete', req, module, id)
        res.status(200).json({
            status: 200,
            message: 'Xóa dữ liệu thành công!',
        })
    },
}
