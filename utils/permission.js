module.exports = {
    getAllPermissionOfUser: (user) => {
        var permissions = [];
        user.roles.forEach(role => {
            role.roleModulePermissions.forEach(roleModulePermission => {
                const name = roleModulePermission.modulePermission.module.name;
                const value = roleModulePermission.modulePermission.permission.value;
                permissions = permissions.concat(`${name}.${value}`)
            })
        })
        return permissions;
    }
}