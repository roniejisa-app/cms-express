const express = require('express')
const router = express.Router()

router.get('/i18n', (req, res) => {
    return res.json({
        status: 200,
        message: 'Hi',
    })
})

module.exports = router