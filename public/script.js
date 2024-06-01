const datas = [
    {
        id: 23,
        name: 'manager_modules',
        name_show: 'Cấu hình Module',
        order: 9999,
        type: 'sql',
        model: 'ManagerModule',
        active: true,
        api: false,
        manager_module_id: 22,
        icon: null,
        managerModule: {
            id: 22,
            icon: '{"id":174,"filename":"buildings-3.svg","path":"buildings-3.svg","path_absolute":"uploads/icons/buildings-3.svg","media_id":171,"customs":"{\\"filename\\":\\"buildings-3.svg\\",\\"media_id\\":171,\\"pathAbsolute\\":\\"uploads/icons/buildings-3.svg\\",\\"path\\":\\"buildings-3.svg\\",\\"extension\\":\\"svg\\",\\"size\\":3213,\\"encoding\\":\\"7bit\\",\\"type\\":\\"image/svg+xml\\",\\"created_at\\":1717223167447}","is_file":true,"extension":"svg","note":null,"description":null,"created_at":"2024-06-01T06:26:07.448Z","updated_at":"2024-06-01T06:26:07.448Z","delete_at":null}',
            name: 'Cài đặt',
            manager_module_id: null,
            order: 1,
        },
    },
    {
        id: 6,
        name: 'modules',
        name_show: 'Module',
        order: null,
        type: 'sql',
        model: 'Module',
        active: true,
        api: false,
        manager_module_id: 22,
        icon: null,
        managerModule: {
            id: 22,
            icon: '{"id":174,"filename":"buildings-3.svg","path":"buildings-3.svg","path_absolute":"uploads/icons/buildings-3.svg","media_id":171,"customs":"{\\"filename\\":\\"buildings-3.svg\\",\\"media_id\\":171,\\"pathAbsolute\\":\\"uploads/icons/buildings-3.svg\\",\\"path\\":\\"buildings-3.svg\\",\\"extension\\":\\"svg\\",\\"size\\":3213,\\"encoding\\":\\"7bit\\",\\"type\\":\\"image/svg+xml\\",\\"created_at\\":1717223167447}","is_file":true,"extension":"svg","note":null,"description":null,"created_at":"2024-06-01T06:26:07.448Z","updated_at":"2024-06-01T06:26:07.448Z","delete_at":null}',
            name: 'Cài đặt',
            manager_module_id: null,
            order: 1,
        },
    },
    {
        id: 22,
        name: 'settings',
        name_show: 'Cấu hình',
        order: 999,
        type: 'sql',
        model: 'Setting',
        active: true,
        api: true,
        manager_module_id: 22,
        icon: null,
        managerModule: {
            id: 22,
            icon: '{"id":174,"filename":"buildings-3.svg","path":"buildings-3.svg","path_absolute":"uploads/icons/buildings-3.svg","media_id":171,"customs":"{\\"filename\\":\\"buildings-3.svg\\",\\"media_id\\":171,\\"pathAbsolute\\":\\"uploads/icons/buildings-3.svg\\",\\"path\\":\\"buildings-3.svg\\",\\"extension\\":\\"svg\\",\\"size\\":3213,\\"encoding\\":\\"7bit\\",\\"type\\":\\"image/svg+xml\\",\\"created_at\\":1717223167447}","is_file":true,"extension":"svg","note":null,"description":null,"created_at":"2024-06-01T06:26:07.448Z","updated_at":"2024-06-01T06:26:07.448Z","delete_at":null}',
            name: 'Cài đặt',
            manager_module_id: null,
            order: 1,
        },
    },
    {
        id: 13,
        name: 'medias',
        name_show: 'Media',
        order: 5,
        type: 'sql',
        model: 'Media',
        active: true,
        api: false,
        manager_module_id: 23,
        icon: null,
        managerModule: {
            id: 23,
            icon: '{"id":172,"filename":"album.svg","path":"album.svg","path_absolute":"uploads/icons/album.svg","media_id":171,"customs":"{\\"filename\\":\\"album.svg\\",\\"media_id\\":171,\\"pathAbsolute\\":\\"uploads/icons/album.svg\\",\\"path\\":\\"album.svg\\",\\"extension\\":\\"svg\\",\\"size\\":1504,\\"encoding\\":\\"7bit\\",\\"type\\":\\"image/svg+xml\\",\\"created_at\\":1717222161224}","is_file":true,"extension":"svg","note":null,"description":null,"created_at":"2024-06-01T06:09:21.226Z","updated_at":"2024-06-01T06:09:21.226Z","delete_at":null}',
            name: 'Media',
            manager_module_id: null,
            order: 1,
        },
    },
    {
        id: 2,
        name: 'users',
        name_show: 'người dùng',
        order: 100,
        type: 'sql',
        model: 'User',
        active: true,
        api: false,
        manager_module_id: 24,
        icon: null,
        managerModule: {
            id: 24,
            icon: '{"id":173,"filename":"plug-circle.svg","path":"plug-circle-svg.svg","path_absolute":"uploads/icons/plug-circle-svg.svg","media_id":171,"customs":"{\\"filename\\":\\"plug-circle-svg.svg\\",\\"media_id\\":171,\\"pathAbsolute\\":\\"uploads/icons/plug-circle-svg.svg\\",\\"path\\":\\"plug-circle-svg.svg\\",\\"extension\\":\\"svg\\",\\"size\\":925,\\"encoding\\":\\"7bit\\",\\"type\\":\\"image/svg+xml\\",\\"created_at\\":1717222458906}","is_file":true,"extension":"svg","note":null,"description":null,"created_at":"2024-06-01T06:14:18.906Z","updated_at":"2024-06-01T06:18:21.735Z","delete_at":null}',
            name: 'Phân quyền',
            manager_module_id: null,
            order: null,
        },
    },
    {
        id: 1,
        name: 'roles',
        name_show: 'Roles',
        order: null,
        type: 'sql',
        model: 'Role',
        active: true,
        api: false,
        manager_module_id: 24,
        icon: null,
        managerModule: {
            id: 24,
            icon: '{"id":173,"filename":"plug-circle.svg","path":"plug-circle-svg.svg","path_absolute":"uploads/icons/plug-circle-svg.svg","media_id":171,"customs":"{\\"filename\\":\\"plug-circle-svg.svg\\",\\"media_id\\":171,\\"pathAbsolute\\":\\"uploads/icons/plug-circle-svg.svg\\",\\"path\\":\\"plug-circle-svg.svg\\",\\"extension\\":\\"svg\\",\\"size\\":925,\\"encoding\\":\\"7bit\\",\\"type\\":\\"image/svg+xml\\",\\"created_at\\":1717222458906}","is_file":true,"extension":"svg","note":null,"description":null,"created_at":"2024-06-01T06:14:18.906Z","updated_at":"2024-06-01T06:18:21.735Z","delete_at":null}',
            name: 'Phân quyền',
            manager_module_id: null,
            order: null,
        },
    },
    {
        id: 3,
        name: 'permissions',
        name_show: 'Phân quyền',
        order: 1,
        type: 'sql',
        model: 'Permission',
        active: true,
        api: false,
        manager_module_id: 24,
        icon: null,
        managerModule: {
            id: 24,
            icon: '{"id":173,"filename":"plug-circle.svg","path":"plug-circle-svg.svg","path_absolute":"uploads/icons/plug-circle-svg.svg","media_id":171,"customs":"{\\"filename\\":\\"plug-circle-svg.svg\\",\\"media_id\\":171,\\"pathAbsolute\\":\\"uploads/icons/plug-circle-svg.svg\\",\\"path\\":\\"plug-circle-svg.svg\\",\\"extension\\":\\"svg\\",\\"size\\":925,\\"encoding\\":\\"7bit\\",\\"type\\":\\"image/svg+xml\\",\\"created_at\\":1717222458906}","is_file":true,"extension":"svg","note":null,"description":null,"created_at":"2024-06-01T06:14:18.906Z","updated_at":"2024-06-01T06:18:21.735Z","delete_at":null}',
            name: 'Phân quyền',
            manager_module_id: null,
            order: null,
        },
    },
    {
        id: 21,
        name: 'posts',
        name_show: 'Tin tức',
        order: 100,
        type: 'nosql',
        model: 'Post',
        active: true,
        api: null,
        manager_module_id: null,
        icon: null,
        managerModule: null,
    },
    {
        id: 20,
        name: 'tasks',
        name_show: 'Task',
        order: 100,
        type: 'sql',
        model: 'Task',
        active: true,
        api: true,
        manager_module_id: null,
        icon: null,
        managerModule: null,
    },
    {
        id: 19,
        name: 'pages',
        name_show: 'Page',
        order: 100,
        type: 'sql',
        model: 'Page',
        active: true,
        api: null,
        manager_module_id: null,
        icon: null,
        managerModule: null,
    },
]

const menuList = {}
modules.forEach((data) => {
    if (data.manager_module_id) {
        const key =
            '0' +
            data.managerModule.order +
            '_' +
            data.manager_module_id +
            '_manager'
        if (!menuList[key]) {
            menuList[key] = {
                ...data.managerModule,
                childs: [],
            }
        }
        menuList[key].childs.push(data)
    } else {
        menuList['1' + data.id] = { ...data }
    }
})
console.log(newData)
