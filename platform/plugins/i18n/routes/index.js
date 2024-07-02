const express = require('express')
const router = express.Router()
const i18n = require("i18n")
const adminMiddleware = require("../../../../middlewares/admin.middleware")
const { pathPlugin } = require('../../../../utils/all')

router.use(adminMiddleware)
router.get(process.env.VITE_AP+'/words', (req, res) => {
    req.app.set('layout', 'layouts/admin')
    res.render(pathPlugin('i18n','views','index'),{
        req
    });
})

router.get('/',async (req, res) => {
    return res.json({
        status: 200,
        message: i18n.__("users:required"),
    })
})

module.exports = router