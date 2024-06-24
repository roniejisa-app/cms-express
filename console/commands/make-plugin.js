const fs = require('fs')
const p = require('@clack/prompts')
const color = require('picocolors')
class MakePlugin {
    constructor() {
        this.createRoot()
    }

    async createRoot() {
        const type = await this.createNamePlugin()
        if(!type) return false;
        const pathPlugin = 'platform/plugins/' + this.name
        const templatePath = 'console/templates/'
        if (!checkPathPlugin) {
            fs.mkdirSync('platform/plugins/' + this.name)
        }
        // Tạo file version.json

        fs.writeFileSync(
            pathPlugin + '/version.json',
            JSON.stringify({
                version: '1.0.0',
                name: this.name,
                description: 'Plugin ' + this.name,
                author: 'Làm plugin thì phải có hướng dẫn sử dụng là plugin nhé 🤣',
                license: 'MIT',
            }),
            {
                mode: 0o755,
                flag: 'w+',
            }
        )
        // Readme
        fs.writeFileSync(
            pathPlugin + '/readme.md',
            '# Làm plugin thì phải có hướng dẫn sử dụng mới là plugin nhé 🤣',
            {
                mode: 0o755,
                flag: 'w+',
            }
        )
        // Config
        const configFile = fs.readFileSync(templatePath + 'config-plugin.tpl')
        fs.writeFileSync(
            pathPlugin + '/config.json',
            configFile.toString().replaceAll('plugin_name', this.name),
            {
                mode: 0o755,
                flag: 'w+',
            }
        )

        //Routes
        fs.mkdirSync(pathPlugin + '/routes')
        const routerTemplate = fs.readFileSync(
            templatePath + 'router-plugin.tpl'
        )
        fs.writeFileSync(
            pathPlugin + '/routes/index.js',
            routerTemplate.toString().replaceAll('router_plugin', this.name),
            {
                mode: 0o755,
                flag: 'w+',
            }
        )
        // Ở chỗ này bắt đầu thêm nhưng file cần cho plugin
        // console.log();
        // fs.mkdir(file, data)
    }
    async createNamePlugin() {
        this.name = await p.text({
            message: 'Tên plugin?',
        })

        const checkPathPlatform = fs.existsSync('platform')
        if (!checkPathPlatform) {
            fs.mkdirSync('platform')
        }

        const checkPathPluginRoot = fs.existsSync('platform/plugins')
        if (!checkPathPluginRoot) {
            fs.mkdirSync('platform/plugins')
        }

        const checkPathPlugin = fs.existsSync('platform/plugins/' + this.name)
        if (checkPathPlugin) {
            await p.note('Plugin đã tồn tại. Vui lý đặt tên khác.')
            return await this.createNamePlugin()
        }
        return true
    }
}

module.exports = MakePlugin
