const fs = require('fs')
class MakeModelMongoDB {
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

        const modelPath = pathPlugin + '/mongodb'
        const checkPathPluginModel = fs.existsSync(modelPath)
        if (!checkPathPluginModel) {
            fs.mkdirSync(modelPath)
        }

        const modelTemplate = fs.readFileSync(
            templatePath + 'model-mongo-plugin.tpl'
        )
        fs.writeFileSync(
            `${modelPath}/${this.modelName}.js`,
            modelTemplate
                .toString()
                .replaceAll('MODEL_NAME', this.modelName),
            {
                mode: 0o755,
                flag: 'w+',
            }
        )
    }
}

module.exports = MakeModelMongoDB
