const DB = require('@mongodb/model')
const { logError } = require('../utils/log')
const model = new DB.Setting().DB
const i18n = require('i18n')
const settingController = {
    index: async (req, res) => {
        try {
            const listData = await model.find().sort({ order: -1 })
            const data = listData.reduce((initialArray, current) => {
                if (!initialArray[current.tab]) {
                    initialArray[current.tab] = {
                        key: current.tab,
                        name: current.tab_label,
                        fields: [],
                    }
                }
                initialArray[current.tab].fields.push(current)
                return initialArray
            }, {})
            return res.render('admin/pages/setting', {
                req,
                module: 'settings',
                name_show: i18n.__('setting'),
                data,
                csrfToken: req.csrfToken(),
            })
        } catch (e) {
            logError('error setting' + e)
        }
    },
    store: async (req, res) => {
        try {
            // cần kiểm tra nếu đã tồn tại thì không được tọa key đó nữa
            const { key } = req.body
            const exist = await model.findOne({ key })
            if (exist) {
                throw new Error(i18n.__('exists', { name: 'Key' }))
            }

            const data = await model.create(req.body)
            return res.status(200).json({
                status: 200,
                data,
                message: i18n.__('create_success', { name: i18n.__('setting') }),
            })
        } catch (e) {
            return res.status(200).json({
                errors: {
                    status: 100,
                    message: e.message,
                },
            })
        }
    },
    update: async (req, res) => {
        try {
            const update = await Promise.all(
                Object.entries(req.body).map(([_id, content]) =>
                    model.updateOne(
                        {
                            _id,
                        },
                        {
                            content,
                        }
                    )
                )
            )
            return res.status(200).json({
                status: 200,
                data: update,
                message: i18n.__('update_success', { name: i18n.__('setting') }),
            })
        } catch (e) {
            return res.status(200).json({
                errors: {
                    status: 100,
                    message: e.errorResponse.errmsg,
                },
            })
        }
    },
}

module.exports = settingController