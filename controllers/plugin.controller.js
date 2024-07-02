const { sync } = require('glob')
const { readFileSync } = require('fs')
const { Module, Permission } = require('@models')
const cache = require('../utils/cache')
const pluginController = {
    index: async (req, res) => {
        const modules = await Module.findAll({
            attributes: ['name', 'id', 'active'],
        })
        const objModules = JSON.parse(JSON.stringify(modules))
        const files = sync(process.cwd() + '/platform/plugins/*/config.json')
        const plugins = await Promise.all(
            files.map(async (file) => {
                const data = readFileSync(file, 'utf8')
                const obj = JSON.parse(data)
                const checkHasInstall = objModules.findIndex(
                    (module) =>
                        (module.name === obj.name ||
                            (obj.module &&
                                obj.module
                                    .map((module) => module.name)
                                    .includes(module.name))) &&
                        module.active
                )
                return {
                    ...obj,
                    installed: checkHasInstall !== -1 ? true : false,
                }
            })
        )
        return res.render('admin/pages/plugin', {
            layout: 'layouts/plugin',
            plugins,
            csrfToken: req.csrfToken(),
        })
    },
    install: async (req, res) => {
        const { name } = req.body
        const module = await Module.findOne({
            where: {
                name,
            },
        })
        if (module) {
            module.update({ active: true })
        } else {
            // Tìm đến folder trong plugins
            const data = readFileSync(
                process.cwd() + `/platform/plugins/${name}/config.json`,
                'utf8'
            )
            const obj = JSON.parse(data)
            for (const module of obj.module) {
                const body = {
                    name: module.name,
                    name_show: module.name_show,
                    order: 9999,
                    active: true,
                }
                if (module.model) {
                    body.model = module.model
                }
                const dataModule = await Module.create(body)
                if (module.permission) {
                    const dataPermission = await Promise.all(
                        module.permission.split(',').map((permission) =>
                            Permission.findOne({
                                where: {
                                    value: permission.trim(),
                                },
                            })
                        )
                    )
                    await dataModule.setPermissions(dataPermission)
                }
            }
        }
        // Kiểm tra nếu chưa có thì phải sinh ra module ở đây

        // await cache.clearAllCache(req,res)
        return res.json({ status: 200 })
    },
    uninstall: async (req, res) => {
        const { name } = req.body
        const module = await Module.findOne({
            where: {
                name,
            },
        })
        if (module) {
            module.update({ active: false })
        }
        //Clear cache
        await cache.clearAllCache(req, res)
        return res.json({ status: 200 })
    },
}

module.exports = pluginController
