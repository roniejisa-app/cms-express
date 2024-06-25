const fs = require('fs')
const p = require('@clack/prompts')
const color = require('picocolors')
class MakePlugin {
    constructor() {
        this.createRoot()
    }

    async createRoot() {
        this.checkPathPlatform = fs.existsSync('platform')
        if (!this.checkPathPlatform) {
            fs.mkdirSync('platform')
        }

        this.checkPathPluginRoot = fs.existsSync('platform/plugins')
        if (!this.checkPathPluginRoot) {
            fs.mkdirSync('platform/plugins')
        }

        await this.newField('Tên plugin?', false, 'label')
        if (typeof this.label === 'symbol') {
            p.outro(color.red('Đã thoát'))
            return false
        }
        await this.newField('Key plugin?', true, 'name')
        if (typeof this.name === 'symbol') {
            p.outro(color.red('Đã thoát'))
            return false
        }

        const pathPlugin = 'platform/plugins/' + this.name
        const templatePath = 'console/templates/'
        if (!this.checkPathPlugin) {
            fs.mkdirSync('platform/plugins/' + this.name)
        }
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
            configFile
                .toString()
                .replaceAll('plugin_label', this.label)
                .replaceAll('plugin_name', this.name)
                .replaceAll(
                    'plugin_date',
                    new Date()
                        .toISOString()
                        .split('T')[0]
                        .split('-')
                        .reverse()
                        .join('/')
                ),
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

        p.outro(`Plugin ${color.green(this.name)} đã được tạo.`)
        // Ở chỗ này bắt đầu thêm nhưng file cần cho plugin
        // console.log();
        // fs.mkdir(file, data)
    }

    async newField(name, check = false, key) {
        this[key] = await p.text({
            message: name,
        })
        if (typeof this[key] === 'symbol') return false
        if (!check) return

        if (check) {
            this.checkPathPlugin = fs.existsSync(
                'platform/plugins/' + this[key]
            )
        }

        if (check && this.checkPathPlugin) {
            await p.outro(
                color.red(`Plugin ${color.cyan(this[key])} đã tồn tại!`)
            )
            return await this.newField(name, check, key)
        }
    }
}

module.exports = MakePlugin
