const fs = require('fs')
class MakePlugin {
    constructor(params) {
        const [name] = params
        this.name = name
        const data = this.createRoot()
        if (data && !data.status) {
            console.log(data.message)
        }
    }

    createRoot() {
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
            return {
                status: false,
                message: 'Plugin đã tồn tại!',
            }
        }
        const pathPlugin = 'platform/plugins/' + this.name
        const templatePath = 'console/templates/'
        if (!checkPathPlugin) {
            fs.mkdirSync('platform/plugins/' + this.name)
        }
        // Readme
        fs.writeFileSync(
            pathPlugin + '/readme.md',
            '# Làm plugin thì phải có hướng dẫn sử dụng mới là plugin nhé 🤣',
            {
                flag: 'w+',
            }
        )
        // Config
        const configFile = fs.readFileSync(templatePath + 'config-plugin.tpl')
        fs.writeFileSync(
            pathPlugin + '/config.json',
            configFile.toString().replaceAll('plugin_name', this.name),
            {
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
            routerTemplate.toString().replaceAll("router_plugin",this.name),
            {
                flag: 'w+',
            }
        )
        // Ở chỗ này bắt đầu thêm nhưng file cần cho plugin
        // console.log();
        // fs.mkdir(file, data)
    }
}

module.exports = MakePlugin
