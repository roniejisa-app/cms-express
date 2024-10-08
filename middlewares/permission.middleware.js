const { getAllPermissionOfUser } = require('@utils/permission')
// Kiêm tra phần quyền
const linkStatic = (link,method) => {
    const links = [
        {
            link: 'check-link',
            method: ['POST'],
        },{
            link: 'plugin-i',
            method: ['GET'],
        },{
            link: undefined,
            method: ['GET'],
        }
    ]
    return links.findIndex(linkItem => linkItem.link === link && linkItem.method.includes(method)) !== -1
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
                    if (linkStatic(module,req.method)) {
                        flag = true
                    } else if (['POST'].includes(req.method)) {
                        flag = permission.some(
                            (permission) =>
                                permission.includes(`${module}.add`) ||
                                permission.includes(`${module}.create`) ||
                                permission.includes(`${module}.view`)
                        )
                    } else {
                        flag = permission.some((permission) =>
                            permission.includes(`${module}.view`)
                        )
                        console.log(flag);
                    }
                    break
            }
            if (!flag) {
                return res.redirect(process.env.VITE_AP)
            }

            next()
        } else {
            res.redirect('/')
        }
    } catch (e) {
        if (!req.user) {
            res.redirect('/login')
        } else {
            res.redirect('/')
        }
    }
}
