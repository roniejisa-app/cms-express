const express = require('express')
const settingController = require('../../controllers/setting.controller')
const router = express.Router()

router.get('/settings', settingController.index)
router.post('/settings', settingController.store)
router.patch('/settings', settingController.update)

module.exports = router
