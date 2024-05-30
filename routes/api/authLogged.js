const express = require('express')
const authController = require('../../controllers/api/auth.controller')
const router = express.Router()

router.get('/profile', authController.profile)
module.exports = router