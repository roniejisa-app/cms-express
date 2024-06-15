const Setting = require('@mongodb/setting.model')
const { findOrCreate } = require('@utils/cache')
const functionHelperInstance = require('./FunctionHelper.alias')
class SettingHelper {
    constructor() {
        this.settings = null
        this.init()
    }

    async init() {
        if (!this.settings) {
            this.settings = await this.loadAlias()
        }
    }
    async loadAlias() {
        return findOrCreate(
            'cms_setting_helper',
            async () => {
                const model = new Setting()
                const data = await model.DB.find({}, { key: 1, content: 1 })
                return data.reduce((initial, item) => {
                    if (!initial[item.key]) {
                        initial[item.key] = item.content
                    }
                    return initial
                }, {})
            },
            true
        )
    }

    getSetting(key, type = null) {
        try{
            const data = this.settings[key] ?? ''
            switch (type) {
                case 'image':
                    return functionHelperInstance.getImage(data)
                default:
                    return data
            }
        }catch(e){
            console.log("Có lỗi ở đây!")
            console.log(e);
            console.log(key);
            return ''
        }
    }

    async update() {
        this.settings = await this.loadAlias()
    }
}

const startHelper = new SettingHelper()
module.exports = startHelper
