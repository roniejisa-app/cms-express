const express = require('express')
const router = express.Router()
const i18n = require('i18n')
router.get('/ecommerce', (req, res) => {
    return res.json({
        status: 200,
        message: i18n.__('require', {
            name: 'Ecommerce'}),
    })
})

module.exports = router
