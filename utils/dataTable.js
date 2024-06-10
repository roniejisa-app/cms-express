const {
    ARRAY_TYPE_HAS_DATA,
    FIELD_TYPE_PERMISSION,
} = require('@constants/module')
const DB = require('@models/index')
const MongoDB = require('@mongodb/model')
const { findOrCreate } = require('./cache')

const functions = {
    SQL,
    NOSQL,
}

async function dataModule(req, isIndex = true, isForm = false) {
    const { module, id } = req.params
    const { model, name, name_show, type } = req.menus.find(
        (itemModule) => itemModule.name === module
    )
    return functions[type.toUpperCase()](
        model,
        name,
        name_show,
        isIndex,
        isForm,
        id,
        module,
        type
    )
}

async function SQL(model, name, name_show, isIndex, isForm, id, module, type) {
    const modelMain = DB[model]
    let allFields = modelMain.fields()
    fields = isIndex
        ? allFields.filter((field) => field.show)
        : allFields.filter((field) => field.showForm)
    if (isForm) {
        for (var i = 0; i < fields.length; i++) {
            if (ARRAY_TYPE_HAS_DATA.includes(fields[i].type)) {
                // Do chưa tải được nên cần lấy ngay model tại chỗ này
                if (id && typeof fields[i].dataEdit === 'function') {
                    fields[i].data = await fields[i].dataEdit(
                        DB[fields[i].modelName],
                        fields[i].name,
                        id
                    )
                } else {
                    fields[i].data = await fields[i].data(
                        DB[fields[i].modelName]
                    )
                }
            }
            if (fields[i].type === FIELD_TYPE_PERMISSION) {
                fields[i].data = await fields[i].data(
                    DB[fields[i].modelName],
                    DB[fields[i].modelAssoc]
                )
            }
        }
    }
    return {
        model,
        module,
        name,
        name_show,
        fields,
        modelMain,
        id,
        allFields,
        type,
    }
}

/**
 *
 * @param {*} model - Tên model
 * @param {*} name - Key
 * @param {*} name_show - Tên hiển thị
 * @param {*} isIndex - Kiểm tra có phải bảng không
 * @param {*} isForm - Trong Form
 * @param {*} id - Trong Form Sửa
 * @param {*} module - Tên module /admin/(module)/...
 * @param {*} type - Kiểu SQL | NOSQL
 * @returns
 */
async function NOSQL(
    model,
    name,
    name_show,
    isIndex,
    isForm,
    id,
    module,
    type
) {
    const modelMain = MongoDB[model]
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
    return {
        model,
        module,
        name,
        name_show,
        fields,
        modelMain,
        id,
        allFields,
        type,
    }
}

async function getDataApi(req) {
    const { module, id } = req.params

    const modules = await findOrCreate('modules-api', async () => {
        const data = await DB['Module'].findAll({
            where: {
                api: true,
                active: true,
            },
        })
        return data
    })
    const { model, name, name_show, type } = Array.from(modules).find(
        (moduleItem) => moduleItem.name === module
    )
    const modelMain =
        type?.toUpperCase() === 'NOSQL' ? MongoDB[model] : DB[model]
    const allFields = modelMain.fields()
    const fields = allFields.filter((field) => field.api)
    return { model, module, name, name_show, fields, modelMain, id, type }
}
module.exports = { dataModule, getDataApi }
