const express = require('express')
const router = express.Router()

router.get('/i18n', async (req, res) => {
    return res.json({
        status: 200,
        message: 'success',
    })
})

module.exports = router
