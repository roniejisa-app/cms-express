const { convertDataFilterMongoDB } = require('@utils/filter')
const event = require('@utils/event')
const { REQUEST_API } = require('@constants/api')
const i18n = require('i18n')
module.exports = {
    all: async (req, res, params) => {
        const { fields, modelMain } = params
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

        // Filter
        if (!limit) {
            limit = 10
        }
        if (!page) {
            page = 1
        }
        const offset = (page - 1) * limit
        const filters = convertDataFilterMongoDB(req.query, fields)
        const selectField = fields.reduce((obj = {}, next) => {
            obj[next.name] = 1
            return obj
        }, {})
        const order = {
            _id: 1,
        }
        const [count, listData] = await Promise.all(
            [
                model.DB.find(filters).count('_id'),
                model.DB.find(filters)
                    .limit(limit)
                    .skip(offset)
                    .sort(order)
                    .select(selectField),
            ].map((data) => data)
        )

        return res.status(200).json({
            status: 200,
            data: {
                count,
                rows: listData,
            },
            message: 'Success',
        })
    },
    one: async (req, res, params) => {
        const { modelMain, fields, id } = params
        const model = new modelMain()
        const selectField = fields.reduce((obj = {}, next) => {
            obj[next.name] = 1
            return obj
        }, {})

        const data = await model.DB.findOne({
            _id: id,
        })
            .select(selectField)
            .exec()
        return res.status(200).json({
            status: 200,
            data,
            message: 'Success',
        })
    },
    create: async (req, res, params) => {
        const { module, name_show, modelMain } = params
        const model = new modelMain()
        const body = await req.validate(
            req.body,
            modelMain.validate(),
            REQUEST_API
        )

        if (req.errors) {
            return res.status(400).json({
                errors: {
                    code: 400,
                    message: i18n.__('create_failed', { name: i18n.__('data') }),
                    details: req.errors,
                },
            })
        }
        const item = await model.DB.create(body)
        event.emit('create', req, module, item, body)
        return res.status(200).json({
            status: 200,
            data: item,
            message: 'Success',
        })
    },
    update: async (req, res, params) => {
        const { module, id, fields, modelMain } = params
        // Chỉnh sửa đầu vào của dữ liệu
        const model = new modelMain()
        const body = await req.validate(
            req.body,
            modelMain.validate(),
            REQUEST_API
        )
        const keyNotAvailable = Object.keys(req.body).filter(
            (key) => !fields.map(({ name }) => name).includes(key)
        )
        if (keyNotAvailable.length > 0) {
            return res.status(400).json({
                errors: {
                    code: 400,
                    message: i18n.__('change_failed', { name: i18n.__('data') }),
                    details: keyNotAvailable.join(', ') + ' ' + i18n.__('does_not_exist'),
                },
            })
        }

        const item = await model.DB.findOne({
            _id: id,
        }).exec()

        if (!item) {
            return res.status(400).json({
                errors: {
                    code: 400,
                    message: i18n.__('no_data_exist', { name: i18n.__('table') }),
                    details: i18n.__('no_data_in', { name: i18n.__('table') }),
                },
            })
        }
        const selectField = fields.reduce((obj = {}, next) => {
            obj[next.name] = 1
            return obj
        }, {})
        const itemUpdate = await model.DB.findOneAndUpdate(
            {
                _id: id,
            },
            {
                ...body,
            },
            {
                new: true,
            }
        )
            .select(selectField)
            .exec()

        event.emit('update', req, module, id, body)
        res.status(200).json({
            status: 200,
            data: itemUpdate,
            message: i18n.__('update_success', { name: i18n.__('data') }),
        })
    },
    delete: async (req, res, params) => {
        const { module, modelMain, id } = params
        //Chỗ này sẽ xóa toàn bộ mọi thứ liên quan không để lại cái gì!!!
        const model = new modelMain()

        await model.DB.deleteOne({
            _id: id,
        })
        event.emit('delete', req, module, id)

        return res.status(200).json({
            status: 200,
            message: i18n.__('delete_success', { name: i18n.__('data') }),
        })
    },
}
