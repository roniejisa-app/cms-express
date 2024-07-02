const DB = require('@models/index')
const { checkLinkExist } = require('../utils/all')
const i18n = require('i18n')
module.exports = {
    dashboard: (req, res) => {
        var name_show = i18n.__('dashboard')
        return res.render('admin/pages/dashboard', { req, name_show })
    },
    checkLink: async (req, res) => {
        const { value, id } = req.body
        const linkData = await DB.Link.findOne({
            where: {
                url: value,
            },
        })
        // Cần kiểm tra để check xem có tồn tại không
        if (!linkData || +id === +linkData.model_id) {
            return res.json({
                status: 200,
                data: value,
            })
        }

        return res.json({
            status: 100,
            message: i18n.__('exist', { name: i18n.__('link') }),
            data: '',
        })
    },
}
