const fs = require('fs')
const p = require('@clack/prompts')
const color = require('picocolors')
const MakeMigration = require('./make-migration')
class MakeModel {
    constructor() {
        this.createRoot()
    }

    async createRoot() {
        await this.createOrCheck('Tên plugin', true, 'pluginName')
        if (typeof this.pluginName === 'symbol') {
            return p.outro(color.red('Đã thoát!'))
        }

        const pathPlugin = 'platform/plugins/' + this.pluginName
        const templatePath = 'console/templates/'
        this.modelPath = pathPlugin + '/models'
        const checkPathPluginModel = fs.existsSync(this.modelPath)
        if (!checkPathPluginModel) {
            fs.mkdirSync(this.modelPath)
        }

        await this.newModel('Tên Model', true, 'modelName')

        if (typeof this.modelName === 'symbol') {
            return p.outro(color.red('Đã thoát!'))
        }

        const modelTemplate = fs.readFileSync(templatePath + 'model-plugin.tpl')
        fs.writeFileSync(
            `${this.modelPath}/${this.modelName}.js`,
            modelTemplate.toString().replaceAll('MODEL_NAME', this.modelName),
            {
                mode: 0o755,
                flag: 'w+',
            }
        )

        p.outro('Đã tạo model ' + color.green(this.modelName) + ' thành công!')
        new MakeMigration(this.pluginName)
    }

    async newModel(name, check = false, key) {
        this[key] = await p.text({
            message: name,
        })
        if (typeof this[key] === 'symbol') return false
        if (!check) return

        // Chỗ này phải là check model có tồn tại hay không
        if (check) {
            this.checkModelPath = fs.existsSync(
                this.modelPath + '/' + this[key] + '.js'
            )
        }
        if (check && this.checkModelPath) {
            await p.outro(
                color.red(`Model ${color.cyan(this[key])} đã tồn tại!`)
            )
            return await this.newModel(name, check, key)
        }
    }

    async createOrCheck(name, check = false, key) {
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

        if (check && !this.checkPathPlugin) {
            await p.outro(
                color.red(
                    `Plugin ${color.cyan(this[key])} không tồn tại tồn tại!`
                )
            )
            return await this.createOrCheck(name, check, key)
        }
    }
}

module.exports = MakeModel
