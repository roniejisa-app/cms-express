const { buildMenuList } = require('../utils/all')
const Cache = require('../utils/cache')
const { User } = require('../models')
const { CACHE_ADMIN_MENU_LIST } = require('../constants/cache')

module.exports = async (req, res, next) => {
    req.user = await User.findOne({
        where: {
            email: 'roniejisa@gmail.com',
        },
    })
    req.app.set('layout', 'layouts/admin')
    req.permission = [
        'modules.view',
        'modules.add',
        'modules.update',
        'modules.delete',
        'users.view',
        'users.add',
        'medias.add',
        'medias.update',
        'medias.delete',
        'medias.view',
        'permissions.add',
        'permissions.update',
        'permissions.delete',
        'permissions.view',
        'users.delete',
        'users.update',
        'roles.create',
        'roles.delete',
        'roles.update',
        'roles.view',
        'pages.create',
        'pages.update',
        'pages.delete',
        'pages.view',
        'pages.custom-page',
        'tasks.view',
        'tasks.create',
        'tasks.delete',
        'tasks.update',
        'posts.view',
        'posts.create',
        'posts.delete',
        'posts.update',
        'settings.view',
        'settings.create',
        'settings.delete',
        'settings.update',
        'manager_modules.view',
        'manager_modules.create',
        'manager_modules.delete',
        'manager_modules.update',
        'post_categories.view',
        'post_categories.create',
        'post_categories.delete',
        'post_categories.update',
        'products.view',
        'products.create',
        'products.delete',
        'products.update',
        'product_categories.view',
        'product_categories.create',
        'product_categories.delete',
        'product_categories.update',
        'product_attributes.view',
        'product_attributes.create',
        'product_attributes.delete',
        'product_attributes.update',
        'product_attribute_details.view',
        'product_attribute_details.create',
        'product_attribute_details.delete',
        'product_attribute_details.update',
        'product_brands.view',
        'product_brands.create',
        'product_brands.delete',
        'product_brands.update',
        'languages.view',
        'languages.create',
        'languages.delete',
        'languages.update',
        'words.view',
        'words.create',
        'words.delete',
        'words.update',
        'crawls.view',
        'crawls.create',
        'crawls.delete',
        'crawls.update',
    ]
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