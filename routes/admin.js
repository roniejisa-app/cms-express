const express = require('express');
const adminController = require('../controllers/admin.controller');
const router = express.Router();
const moduleRouter = require('./module');
const mediaRouter = require('./media');
const Cache = require('../utils/cache');
// Bắt đầu vào quản trị
const permissionMiddleware = require('../middlewares/permission.middleware');
router.use(permissionMiddleware, async (req, res, next) => {
    req.menus = await Cache.getMenu();
    if (!req.menus || Array.isArray(req.menus) || true) {
        await Cache.setMenu(req,true);
    }

    req.permission = [
        "modules.view",
        "modules.add",
        "modules.update",
        "modules.delete",
        "users.view",
        "users.add",
        "medias.add",
        "medias.update",
        "medias.delete",
        "medias.view",
        // "permissions.add",
        // "permissions.update",
        "permissions.delete",
        "permissions.view",
        "users.delete",
        "users.update",
        "roles.create",
        "roles.delete",
        "roles.update",
        "roles.view",
    ];
    req.app.set('layout', 'layouts/admin');
    next()
})
router.get('/', adminController.dashboard);
router.get('/clear-cache', Cache.clearCache);
router.use('/medias', mediaRouter);
router.use(moduleRouter);
// router.use('/:{module}', usersRouter);
// router.get('/dashboard', adminController.dashboard);
// router.use('/roles', rolesRouter);
// router.use('/permissions', permissionsRouter);

module.exports = router;