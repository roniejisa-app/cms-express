const express = require('express')
const settingController = require('@controllers/setting.controller')
const router = express.Router()
var csrf = require('csurf')
var csrfProtect = csrf({ cookie: true })
router.get('/', csrfProtect, settingController.index)
router.post('/', csrfProtect, settingController.store)
router.patch('/', csrfProtect, settingController.update)
module.exports = router