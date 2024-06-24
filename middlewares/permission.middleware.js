const { getAllPermissionOfUser } = require('@utils/permission')
// Kiêm tra phần quyền
const linkStatic = (link) => {
    return ['check-link',"plugin-i"].includes(link)
}

module.exports = async (req, res, next) => {
    try {
        const [_, admin, module, action, id] = req.originalUrl.split('/')
        const permission = await getAllPermissionOfUser(req.user)
        if (
            permission.filter((permission) => permission.match(/.+.view/))
                .length
        ) {
            req.permission = permission
            var flag = false
            switch (action) {
                case 'add':
                case 'create':
                    flag = permission.some(
                        (permission) =>
                            permission.includes(`${module}.add`) ||
                            permission.includes(`${module}.create`)
                    )
                    break
                case 'edit':
                case 'update':
                    flag = permission.some(
                        (permission) =>
                            permission.includes(`${module}.update`) ||
                            permission.includes(`${module}.edit`)
                    )
                    break
                case 'delete':
                    flag =
                        permission.some((permission) =>
                            permission.includes(`${module}.delete`)
                        ) ||
                        permission.some((permission) =>
                            permission.includes(`${module}.destroy`)
                        )
                    break
                default:
                    if (linkStatic(module)) {
                        flag = true
                    } else if (['POST'].includes(req.method)) {
                        flag = permission.some(
                            (permission) =>
                                permission.includes(`${module}.add`) ||
                                permission.includes(`${module}.create`) ||
                                permission.includes(`${module}.view`)
                        )
                    } else {
                        flag =
                            permission.some((permission) =>
                                permission.includes(`${module}.view`)
                            ) || !module
                    }
                    console.log(flag, module)
                    break
            }
            if (!flag) {
                res.redirect(process.env.VITE_AP)
            }
            next()
        } else {
            res.redirect('/')
        }
    } catch (e) {
        res.redirect('/login')
    }
}
