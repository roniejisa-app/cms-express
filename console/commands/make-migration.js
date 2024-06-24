const fs = require('fs')
const { toKebabCase } = require('../../utils/all')
const p = require('@clack/prompts')
const color = require('picocolors')
class MakeMigration {
    constructor(pluginName = '') {
        if (pluginName) {
            this.pluginName = pluginName
        }
        const data = this.createRoot()
    }

    async createRoot() {
        if (!this.pluginName) {
            await this.createOrCheck('Plugin tên?', true, 'pluginName')
            if (typeof this.pluginName === 'symbol') {
                return p.outro(color.red('Đã thoát!'))
            }
        }

        const pathPlugin = 'platform/plugins/' + this.pluginName
        const templatePath = 'console/templates/'
        this.migrationPath = pathPlugin + '/migrations'
        const checkPathPluginMigration = fs.existsSync(this.migrationPath)
        if (!checkPathPluginMigration) {
            fs.mkdirSync(this.migrationPath)
        }
        await this.newMigration('Tên migration', 'migrationName')
        const migrationTemplate = fs.readFileSync(
            templatePath + 'migration-plugin.tpl'
        )
        fs.writeFileSync(
            `${this.migrationPath}/${new Date().getTime()}-${toKebabCase(
                this.migrationName
            )}.js`,
            migrationTemplate
                .toString()
                .replaceAll('migration_name', this.migrationName),
            {
                mode: 0o755,
                flag: 'w+',
            }
        )
        p.outro('Đã tạo migration '+color.green(this.migrationName)+' thành công!')
        // Ở chỗ này bắt đầu thêm nhưng file cần cho plugin
        // fs.mkdir(file, data)
    }

    async newMigration(name, key) {
        this[key] = await p.text({
            message: name,
        })

        if (this[key] === undefined) {
            p.outro(color.red('Vui lòng nhập tên migration!'))
            return await this.newMigration(name, key)
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
            return await this.newField(name, check, key)
        }
    }
}

module.exports = MakeMigration
