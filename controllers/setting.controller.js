const DB = require('../mongodb/model')
const model = new DB.Setting().DB
const settingController = {
    index: async (req, res) => {
        // try {
        const listData = await model.find()
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
        console.log(
            res.render('admin/pages/setting', {
                req,
                module: 'settings',
                name_show: 'Cài đặt',
                data,
            })
        )
        return res.render('admin/pages/setting', {
            req,
            module: 'settings',
            name_show: 'Cài đặt',
            data,
        })
        // } catch (e) {
        //     console.log(e.error.message)
        // }
    },
    store: async (req, res) => {
        const data = await model.create(req.body)
        return res.redirect('/admin/settings')
    },
    update: async (req, res) => {    
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
            data:update,
            message: 'Cập nhật thành công!',
        })
    },
}

module.exports = settingController
