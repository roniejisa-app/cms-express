const { getAllPermissionOfUser } = require('@utils/permission');
// Kiêm tra phần quyền
module.exports =async (req, res, next) => {
    try {
        const [_, admin, module, action, id] = req.originalUrl.split('/');
        const permission =await getAllPermissionOfUser(req.user);
        if (permission.filter(permission => permission.match(/.+.view/)).length) {
            req.permission = permission;
            var flag = false;
            switch (action) {
                case 'add':
                case 'create':
                    flag = permission.some(permission => permission.includes(`${module}.add`) || permission.includes(`${module}.create`))
                    break;
                case 'edit':
                case 'update':
                    flag = permission.some(permission => permission.includes(`${module}.update`) || permission.includes(`${module}.edit`))
                    break;
                case 'delete':
                    flag = permission.some(permission => permission.includes(`${module}.delete`))
                    break;
                default:
                    if (['POST'].includes(req.method)) {
                        flag = permission.some(permission => permission.includes(`${module}.add`) || permission.includes(`${module}.create`))
                    } else {
                        flag = permission.some(permission => permission.includes(`${module}.view`)) || !module;
                    }
                    break;
            }
            if (!flag) {
                res.redirect('/admin');
            }
            next();
        } else {
            res.redirect('/');
        }
    } catch (e) {
        res.redirect('/login');
    }
}