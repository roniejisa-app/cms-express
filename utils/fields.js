module.exports = {
    /**
     * Thêm hoặc sửa Item thêm quan hệ cho chính nó
     * @param {*} modelName // Model Associate
     * @param {*} valueKey // Key giá trị thê
     * @param {*} labelKey // Key Tên hiển thị
     * @param {*} fn // Định danh của associate
     */
    chooseMultiAssoc: (modelName, valueKey, labelKey, fn) => {
        return {
            type: 'selectMultiAssoc',
            modelName: modelName,
            valueKey: valueKey,
            labelKey: labelKey,
            /**
             * Thêm hoặc sửa Item thêm quan hệ cho chính nó
             * @param {*} item // Item hiện tại đang chỉnh sửa hoặc thêm
             * @param {*} model // Model chính là modelTable
             * @param {*} data // Các id quan hệ với Item
             * @param {*} isAdd // Kiểm tra xem có phải thêm mới
             */
            addOrEditAssociate: async (item, model, data, isAdd = true) => {
                data = await Promise.all(
                    data.map((id) => {
                        return model.findByPk(id)
                    })
                )
                const newFn = (isAdd ? 'add' : 'set') + fn
                if (isAdd && !data.length) {
                    return true
                }
                await item[newFn](data)
            },
            data: async (model) => {
                return await model.findAll({ attribute: [valueKey, labelKey] })
            },
        }
    },
    /**
     * Thêm hoặc sửa Item thêm quan hệ cho chính nó
     * @param {*} modelName // Model Associate
     * @param {*} valueKey // Key giá trị thê
     * @param {*} labelKey // Key Tên hiển thị
     */
    selectAssoc: (modelName, valueKey, labelKey) => {
        return {
            data: async (model) => {
                const results = await model.findAll({
                    attributes: [valueKey, labelKey],
                })
                return results
            },
            type: 'selectAssoc',
            modelName: modelName,
            valueKey: valueKey,
            labelKey: labelKey,
        }
    },
    choosePermission: () => {
        return {
            modelName: 'Module',
            modelAssoc: 'Permission',
            modelModulePermission: 'ModulePermission',
            modelRoleModulePermission: 'RoleModulePermission',
            asRoleModulePermission: 'roleModulePermissions',
            asModulePermission: 'modulePermission',
            include: (modelRoleModulePermission, modelModulePermission) => {
                return [
                    {
                        model: modelRoleModulePermission,
                        as: 'roleModulePermissions',
                        include: {
                            model: modelModulePermission,
                            as: 'modulePermission',
                        },
                    },
                ]
            },
            data: async (model, modelAssoc) => {
                return await model.findAll({
                    where: {
                        active: true,
                    },
                    include: [
                        {
                            model: modelAssoc,
                            as: 'permissions',
                        },
                    ],
                })
            },
            addOrEditPermission: async (
                item,
                model,
                data,
                mainKey,
                subKey,
                fn,
                idAdd = true
            ) => {
                let newData = await Promise.all(
                    data.map(async function (item) {
                        if (item) {
                            const [mainId, subId] = item.split('|')
                            const filter = {}
                            filter[mainKey] = mainId
                            filter[subKey] = subId
                            return model.findOne({
                                where: filter,
                            })
                        }
                        return false
                    })
                )

                if (Array.isArray(newData)) {
                    newData = newData.filter((data) => data)
                }

                fn = (idAdd ? 'add' : 'set') + fn
                await item[fn](newData)
            },
            mainKey: 'module_id',
            subKey: 'permission_id',
            fn: 'ModulePermissions',
            valueKey: 'id',
            labelKey: 'name_show',
            asModelAssoc: 'permissions', // Chỗ này ở form
            valueKeyOfAssoc: 'id', // Chỗ này ngoài view
            labelKeyOfAssoc: 'name', // Chỗ này ngoài view
        }
    },
}
