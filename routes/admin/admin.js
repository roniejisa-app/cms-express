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
const { buildMenuList } = require('@utils/all')
const { CACHE_ADMIN_MENU_LIST } = require('../../constants/cache')
// permissionMiddleware
router.use(permissionMiddleware, async (req, res, next) => {
    // req.permission = [
    //     'modules.view',
    //     'modules.add',
    //     'modules.update',
    //     'modules.delete',
    //     'users.view',
    //     'users.add',
    //     'medias.add',
    //     'medias.update',
    //     'medias.delete',
    //     'medias.view',
    //     'permissions.add',
    //     'permissions.update',
    //     'permissions.delete',
    //     'permissions.view',
    //     'users.delete',
    //     'users.update',
    //     'roles.create',
    //     'roles.delete',
    //     'roles.update',
    //     'roles.view',
    //     'pages.create',
    //     'pages.update',
    //     'pages.delete',
    //     'pages.view',
    //     'pages.custom-page',
    //     'tasks.view',
    //     'tasks.create',
    //     'tasks.delete',
    //     'tasks.update',
    //     'posts.view',
    //     'posts.create',
    //     'posts.delete',
    //     'posts.update',
    //     'settings.view',
    //     'settings.create',
    //     'settings.delete',
    //     'settings.update',
    //     'manager_modules.view',
    //     'manager_modules.create',
    //     'manager_modules.delete',
    //     'manager_modules.update',
    //     'post_categories.view',
    //     'post_categories.create',
    //     'post_categories.delete',
    //     'post_categories.update',
    // ]
    req.menus = await Cache.getMenu(req.user)
    if (!req.menus) {
        await Cache.setMenu(req, true)
    }

    const menuView = req.menus.filter((menu) =>
        req.permission.some((permission) => {
            return permission.includes(`${menu.name}.view`) && menu.active
        })
    )
    req.menuList = await Cache.findOrCreate(CACHE_ADMIN_MENU_LIST + req.user.id, buildMenuList(menuView))

    req.menuList = Object.values(req.menuList).sort((a, b) => a.order - b.order)
    // req.user = await User.findOne({
    //     where: {
    //         email: 'roniejisa@gmail.com',
    //     },
    // })

    req.app.set('layout', 'layouts/admin')
    next()
})
router.get('/', adminController.dashboard)
router.post('/check-link', adminController.checkLink)
router.get('/clear-cache', Cache.clearCache)
router.use('/medias', mediaRouter)
router.use(settingRouter)
router.use(moduleRouter)
// router.use('/:{module}', usersRouter);
// router.get('/dashboard', adminController.dashboard);
// router.use('/roles', rolesRouter);
// router.use('/permissions', permissionsRouter);

module.exports = router
