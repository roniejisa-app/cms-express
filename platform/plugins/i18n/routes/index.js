const express = require('express')
const router = express.Router()
const i18n = require('i18n')
const fakeMiddleware = require('../../../../middlewares/fake.middleware')
const { pathPlugin } = require('../../../../utils/all')


router.get('/i18n', async (req, res) => {
    return res.json({
        status: 200,
        message: 'success',
    })
})

module.exports = router
