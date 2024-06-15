const bcrypt = require('bcrypt')
const {
    FIELD_TYPE_INTEGER,
    FIELD_TYPE_PERMISSION,
    ARRAY_TYPE_HAS_MULTIPLE,
    IS_NOT_ADD,
} = require('@constants/module')
const { convertDataFilterMongoDB } = require('@utils/filter')
const event = require('@utils/event')
const DB = require('@models/index')
const { REQUEST_API } = require('@constants/api')

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
                    message: 'Thêm dữ liệu không thành công',
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
                    message: 'Thay đổi dữ liệu không thành công',
                    details: keyNotAvailable.join(', ') + ' không tồn tại!',
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
                    message: 'Không tồn tại dữ liệu trong bảng!',
                    details: 'Không có dữ liệu trong bảng',
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
            message: 'Thay đổi dữ liệu thành công',
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
            message: 'Xóa dữ liệu thành công!',
        })
    },
}
