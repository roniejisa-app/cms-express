const fs = require('fs')
class MakeModel {
    constructor(params) {
        const [name_plugin, modelName] = params
        this.pluginName = name_plugin
        this.modelName = modelName
        const data = this.createRoot()
        if (data && !data.status) {
            console.log(data.message)
        }
    }

    createRoot() {
        const pathPlugin = 'platform/plugins/' + this.pluginName
        const templatePath = 'console/templates/'
        const checkPathPlugin = fs.existsSync(pathPlugin)
        if (!checkPathPlugin) {
            return {
                status: false,
                message: 'Plugin không tồn tại!',
            }
        }

        const modelPath = pathPlugin + '/models'
        const checkPathPluginMigration = fs.existsSync(modelPath)
        if (!checkPathPluginMigration) {
            fs.mkdirSync(modelPath)
        }

        const migrationTemplate = fs.readFileSync(
            templatePath + 'model-plugin.tpl'
        )
        fs.writeFileSync(
            `${modelPath}/${this.modelName}.js`,
            migrationTemplate
                .toString()
                .replace('modelName', this.migrationName),
            {
                flag: 'w+',
            }
        )
    }
}

module.exports = MakeModel
