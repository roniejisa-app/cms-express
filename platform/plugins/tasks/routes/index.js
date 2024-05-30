const express = require('express')
const router = express.Router()

router.get('/tasks', (req, res) => {
    return res.json({
        status: 200,
        message: 'Hi',
    })
})

module.exports = router
