# Tạo Model bằng CLI

npx sequelize-cli model:generate --name User --attributes id:integer

npx sequelize migration:generate --name=create_users_table

## Tạo field

- hasOne
- belongsTo
- Xem ở user.js trong models

- belongsToMany
- Xem ở module.js

```text
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

## ABCD

- App
    public
        - plugins
            -  pages
                - assets
                    - scss
                        - [file].css
                    - js
                    - images
            - products
                - assets
                    - scss
                    - images
    platform
        - plugins
            - pages
                - assets
                    - scss
                    - js
            - products
                - assets
                    - scss
                    - jsp

## COMMAND

roniejisa ...

- Make Plugins

```bash
roniejisa make:plugins ten_plugin
```

- Make Model - Migration

```bash
roniejisa make:model ten_plugin ten_model
```

- Make Migration

```bash
roniejisa make:migration ten_plugin ten_migration
```

- Active Plugins

```bash
roniejisa active:plugin ten_plugin key model name
```

-- Cập nhật Migration

```bash
roniejisa migration
```

<!-- Có thể dùng cả mongodb và sequelize -->
<!-- Sẽ dùng mongodb để sử lý những cái như comment, chat -->
<!-- Đã xong bước đầu -->
<!-- Nên dùng mongodb khi dữ liệu lớn và thường không có liên kết các bảng -->