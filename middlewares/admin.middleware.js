const { buildMenuList } = require('../utils/all')
const Cache = require('../utils/cache')
const { User } = require('../models')
const { CACHE_ADMIN_MENU_LIST } = require('../constants/cache')

module.exports = async (req, res, next) => {
    req.app.set('layout', 'layouts/admin')
    req.menus = await Cache.getMenu(req.user)
    if (!req.menus) {
        await Cache.setMenu(req, true)
    }

    const menuView = req.menus.filter((menu) =>
        req.permission.some((permission) => {
            return permission.includes(`${menu.name}.view`) && menu.active
        })
    )
    req.menuList = await Cache.findOrCreate(
        CACHE_ADMIN_MENU_LIST + req.user.id,
        buildMenuList(menuView)
    )

    req.menuList = Object.values(req.menuList).sort((a, b) => a.order - b.order)
    next()
}
