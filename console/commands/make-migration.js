const fs = require('fs')
const { toSnakeCase, toKebabCase } = require('../../utils/all')
class MakeMigration {
    constructor(params) {
        const [name_plugin, name_migration] = params
        this.pluginName = name_plugin
        this.migrationName = name_migration
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

        const migrationPath = pathPlugin + '/migrations'
        const checkPathPluginMigration = fs.existsSync(migrationPath)
        if (!checkPathPluginMigration) {
            fs.mkdirSync(migrationPath)
        }

        const migrationTemplate = fs.readFileSync(
            templatePath + 'migration-plugin.tpl'
        )
        fs.writeFileSync(
            `${migrationPath}/${new Date().getTime()}-${toKebabCase(
                this.migrationName
            )}.js`,
            migrationTemplate
                .toString()
                .replaceAll('migration_name', this.migrationName),
            {
                flag: 'w+',
            }
        )
        // Ở chỗ này bắt đầu thêm nhưng file cần cho plugin
        // fs.mkdir(file, data)
    }
}

module.exports = MakeMigration
