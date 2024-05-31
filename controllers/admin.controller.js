const Index = require('@models/index')
const { checkLinkExist } = require('@utils/all')
module.exports = {
    dashboard: (req, res) => {
        var name_show = 'Trang tổng quan'
        return res.render('admin/pages/dashboard', { req, name_show })
    },
    checkLink: async (req, res) => {
        const data = await checkLinkExist(req.body)
        return res.json(data)
    },
}
