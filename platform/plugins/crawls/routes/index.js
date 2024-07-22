const express = require('express')
const router = express.Router()

router.get('/crawl', (req, res) => {
    return res.json({
        status: 200,
        message: 'Hi',
    })
})

module.exports = router