const express = require('express')
const router = express.Router()
const pluginController = require('@controllers/plugin.controller')
router.get('/plugins', pluginController.index)
module.exports = router
