const db = require('../../models/index')
const dbMongo = require('../../mongodb/model.js')
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
}

module.exports = ActivePlugin
