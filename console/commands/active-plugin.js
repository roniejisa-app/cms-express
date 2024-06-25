const db = require('../../models/index')
const dbMongo = require('../../mongodb/model.js')
const fs = require('fs')
const p = require('@clack/prompts')
const color = require('picocolors')
class ActivePlugin {
    constructor(params) {
        // const [plugin, key, model, name, type] = params
        // this.name = name
        // this.plugin = plugin
        // this.key = key
        // this.model = model
        // this.type = type
        // this.permission = ['create', 'update', 'view', 'delete']
        // // Đầu tiên cần kiểm tra xem model có tồn tại hay không
        this.createModule()
    }
    async createModule() {
        // Thực tế chỉ kiểm tra xem plugin có tồn tại hay không trước
        await this.createOrCheck('Plugin name:', true, 'plugin_name')
        if (typeof this.plugin_name === 'symbol') {
            p.outro(color.red('Đã thoát'))
            return false
        }
        // Sau đó phải kiểm tra trường hợp có model hay không
        this.model = await p.select({
            message: 'Module type:',
            initialValue: '1',
            options: [
                {
                    value: 'table',
                    label: 'Có bảng',
                },
                {
                    value: '',
                    label: 'Không có bảng',
                },
            ],
        })
        if(!db[this.model] || !dbMongo[this.model]) {
            p.outro('Vui lòng kiểm tra lại '+ color.red(this.model) + ' không tồn tại!');
            return false
        }

        // Module thì không nhất thiết phải có model mà chỉ cần xác nhận xem module đó có tồn tại hay không
        await this.createNoCheck('Module name url:', true, 'key')
        await this.createNoCheck('Module name show:', true, 'name_show')
        if (this.model !== '') {
            this.type = await p.select({
                message: 'Module type:',
                options: [
                    {
                        value: 'sql',
                        label: 'SQL',
                    },
                    {
                        value: 'nosql',
                        label: 'NOSQL',
                    },
                ],
            })
        }
        this.permission = await p.multiselect({
            message: 'Select permission:',
            options: [
                {
                    value: 'create',
                    label: 'create',
                },
                {
                    value: 'update',
                    label: 'update',
                },
                {
                    value: 'view',
                    label: 'view',
                },
                {
                    value: 'delete',
                    label: 'delete',
                },
            ],
        })

        const body = {
            name: this.key,
            name_show: this.name_show,
            order: 9999,
            active: true,
        }

        if (this.model) {
            body.model = this.model
        }
        if (this.type) {
            body.type = this.type
            // Kiểm tra kĩ chỗ này!
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
        await dataModule.setPermissions(dataPermission)
        p.outro(color.green('Kích hoạt module '+ color.cyan(this.key) +' thành công!'))
    }
    async createNoCheck(name, check = false, key) {
        this[key] = await p.text({
            message: name,
        })
        if (typeof this[key] === undefined) {
            await p.outro(color.red(`Hãy điền ${color.cyan(this[key])}!`))
            return await this.createNoCheck(name, check, key)
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

module.exports = ActivePlugin
