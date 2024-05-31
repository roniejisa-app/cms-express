const DB = require('@mongodb/model')
const model = new DB.Setting().DB
const csrf = require('csurf');

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
                name_show: 'Cài đặt',
                data,
                csrfToken: req.csrfToken(),
            })
        } catch (e) {
            console.log(e)
        }
    },
    store: async (req, res) => {
        try {
            const data = await model.create(req.body)
            return res.status(200).json({
                status: 200,
                data,
                message: 'Thêm cài đặt thành công!',
            })
        } catch (e) {
            return res.status(100).json({
                errors: {
                    status: 100,
                    message: e.errorResponse.errmsg,
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
                message: 'Cập nhật thành công!',
            })
        } catch (e) {
            return res.status(100).json({
                errors: {
                    status: 100,
                    message: e.errorResponse.errmsg,
                },
            })
        }
    },
}

module.exports = settingController
