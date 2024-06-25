const db = require('../../models/index')
const dbMongo = require('../../mongodb/model.js')
const p = require('@clack/prompts')
const color = require('picocolors')
class ActivePlugin {
    constructor(params) {
        const [plugin, key, model, name, type] = params
        this.name = name
        this.plugin = plugin
        this.key = key
        this.model = model
        this.type = type
        this.permission = ['create', 'update', 'view', 'delete']

        if (db[this.model] || dbMongo[this.model]) {
            this.createModel()
        }
    }
    async createModel() {
        const body = {
            name: this.key,
            name_show: this.name ? this.name : this.model,
            order: 100,
            model: this.model,
            active: true,
            type: this.type || 'sql',
        }
        const [dataModule, isCreate] = await db.Module.findOrCreate({
            where: { name: this.key },
            defaults: body,
        })

        const dataPermission = await Promise.all(
            this.permission.map((permission) =>
                db.Permission.findOne({
                    where: {
                        value: permission,
                    },
                })
            )
        )
        if (isCreate) {
            await dataModule.addPermissions(dataPermission)
        } else {
            await dataModule.setPermissions(dataPermission)
        }
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

module.exports = ActivePlugin
