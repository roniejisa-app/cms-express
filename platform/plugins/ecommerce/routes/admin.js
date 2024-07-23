const express = require('express')
const router = express.Router()
var csrf = require('csurf')
const costController = require('../controllers/cost.controller')
var csrfProtect = csrf({ cookie: true })
router.get('/sale-costs/:id', csrfProtect, costController.find)
module.exports = router