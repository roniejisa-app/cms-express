const express = require('express')
const adminController = require('../../controllers/admin.controller')
const router = express.Router()
const moduleRouter = require('./module')
const mediaRouter = require('./media')
const settingRouter = require('./setting')
const Cache = require('@utils/cache')
const { User } = require('@models/index')
// Bắt đầu vào quản trị
const permissionMiddleware = require('@middlewares/permission.middleware')
const pluginRouter = require('./plugin');
const adminMiddleware = require('@middlewares/admin.middleware')
// permissionMiddleware
router.use(permissionMiddleware, adminMiddleware)
router.get('/', adminController.dashboard)
router.post('/check-link', adminController.checkLink)
router.get('/clear-cache', Cache.clearAllCache)
router.use('/medias', mediaRouter)
router.use('/settings',settingRouter);
// Cài đặt plugin cần đứng ở đây vì khi bắt đầu người dùng phải có quyền rồi
router.use('/plugin-i',pluginRouter);
router.use(moduleRouter);
module.exports = router