const Cache = require('@utils/cache')
const { CACHE_USER_PERMISSION } = require('../constants/cache')

module.exports = {
    getAllPermissionOfUser: async (user) => {
        // Chỗ này cần lưu cache

        var permissions = await Cache.get(CACHE_USER_PERMISSION + user.id, [])

        if (permissions.length > 0) {
            return permissions
        }
        user.roles.forEach((role) => {
            role.roleModulePermissions.forEach((roleModulePermission) => {
                if (roleModulePermission.modulePermission) {
                    const name =
                        roleModulePermission.modulePermission.module.name
                    const value =
                        roleModulePermission.modulePermission.permission.value
                    permissions = permissions.concat(`${name}.${value}`)
                }
            })
        })

        await Cache.set(CACHE_USER_PERMISSION, permissions)
        return permissions
    },
}
