const { sync } = require('glob')
const { readFileSync } = require('fs')
const { Module } = require('@models')
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
                    (module) => module.name === obj.name && module.active
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
        }
        // Kiểm tra nếu chưa có thì phải sinh ra module ở đây
        
        await cache.clearAllCache(req,res)
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
        await cache.clearAllCache(req,res)
        return res.json({ status: 200 })
    },
}

module.exports = pluginController
