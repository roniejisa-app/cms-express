const express = require('express')
const router = express.Router()

router.get('/sol', (req, res) => {
    return res.json({
        status: 200,
        message: 'Hi',
    })
})

module.exports = router