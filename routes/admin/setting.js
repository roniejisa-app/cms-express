const express = require('express')
const settingController = require('@controllers/setting.controller')
const router = express.Router()
var csrf = require('csurf')
var csrfProtect = csrf({ cookie: true })
router.get('/settings', csrfProtect, settingController.index)
router.post('/settings', csrfProtect, settingController.store)
router.patch('/settings', csrfProtect, settingController.update)

module.exports = router
