const express = require('express')
const router = express.Router()
const pluginController = require('@controllers/plugin.controller')
var csrf = require('csurf')
var csrfProtect = csrf({ cookie: true })
router.get('/', csrfProtect, pluginController.index)
router.post('/install', csrfProtect, pluginController.install)
router.post('/uninstall', csrfProtect, pluginController.uninstall)
module.exports = router
