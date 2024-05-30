const {
    ARRAY_TYPE_HAS_DATA,
    FIELD_TYPE_PERMISSION,
} = require('../contains/module')
const DB = require('../models/index')
const { findOrCreate } = require('./cache')

async function getData(req, isIndex = true, isForm = false) {
    const { module, id } = req.params
    const { model, name, name_show } = req.menus.find(
        (itemModule) => itemModule.name === module
    )
    const modelMain = DB[model]
    let allFields = modelMain.fields()
    fields = isIndex
        ? allFields.filter((field) => field.show)
        : allFields.filter((field) => field.showForm)
    if (isForm) {
        for (var i = 0; i < fields.length; i++) {
            if (ARRAY_TYPE_HAS_DATA.includes(fields[i].type)) {
                // Do chưa tải được nên cần lấy ngay model tại chỗ này
                fields[i].data = await fields[i].data(DB[fields[i].modelName])
            }
            if (fields[i].type === FIELD_TYPE_PERMISSION) {
                fields[i].data = await fields[i].data(
                    DB[fields[i].modelName],
                    DB[fields[i].modelAssoc]
                )
            }
        }
    }
    return { model, module, name, name_show, fields, modelMain, id, allFields }
}

async function getDataApi(req) {
    const { module, id } = req.params

    const modules = await findOrCreate('modules-api3', async () => {
        const data = await DB['Module'].findAll({
            where: {
                api: true,
                active: true,
            },
        })
        return data
    })
    const { model, name, name_show } = Array.from(modules).find(
        (moduleItem) => moduleItem.name === module
    )
    const modelMain = DB[model]
    const allFields = modelMain.fields()
    const fields = allFields.filter((field) => field.api)
    return { model, module, name, name_show, fields, modelMain, id }
}
module.exports = { getData, getDataApi }
