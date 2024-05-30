const express = require('express')
const authController = require('../../controllers/api/auth.controller')
const router = express.Router()

router.post('/login', authController.login)
router.post('/refresh-token', authController.refreshToken)
module.exports = router