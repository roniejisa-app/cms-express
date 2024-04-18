# Tạo Model bằng CLI

npx sequelize-cli model:generate --name User --attributes id:integer

npx sequelize migration:generate --name=create_users_table

# Tạo field

- hasOne
- belongsTo
- Xem ở user.js trong models

- belongsToMany
- Xem ở module.js

```
{
    type: "selectMultiAssoc",
    modelName: 'Permission',
    valueKey: 'id',
    labelKey: 'value',
    /**
        * Thêm hoặc sửa Item thêm quan hệ cho chính nó
        * @param {*} item // Item hiện tại đang chỉnh sửa hoặc thêm
        * @param {*} model // Model chính là modelTable
        * @param {*} data // Các id quan hệ với Item
        */
    addOrEditAssociate: async (item, model, data, isAdd = true) => {
        data = await Promise.all(data.map((courseId) => {
            return model.findByPk(courseId)
        }))
        isAdd ? await item.addPermissions(data) : await item.setPermissions(data);
    },
    data: async (model) => {
        return await model.findAll({ attribute: ["id", "name"] })
    },
}

```
