const { Op } = require('sequelize')
const { buildTree, printTree, printTreeChoose } = require('./all')

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
    selectParentAssoc: (
        modelName,
        valueKey,
        labelKey,
        parentName,
        hasCheckLevel = false,
        modelRelateTo = []
    ) => {
        return {
            data: async (model) => {
                const results = await model.findAll({
                    attributes: [valueKey, labelKey, parentName],
                })
                const arr = results.map((item) => {
                    return item.dataValues
                })
                // Xây dựng cây từ danh sách dữ liệu ban đầu
                const tree = buildTree(arr, null, 1, parentName, valueKey)
                return {
                    printTree,
                    tree,
                }
            },
            /**
             *
             * @param {*} model Model sử dụng
             * @param {*} name Tên trường hiện tại cần tìm cha, con
             * @param {*} id ID hiện tại
             * @returns
             * Yêu cầu: Lấy tất cả các giá trị không liên quan tới con và cha của nó
             * Cách giải quyết: để quy bắt đầu từ chính nó
             */
            dataEdit: async (model, name, id) => {
                let filters = {}
                if (hasCheckLevel) {
                    // id là id hiện tại
                    // Lặp đi lặp lại tìm cha, tìm con cho tới khi không còn cấp nào nữa thì thôi
                    // Đầu tiên sẽ là tìm con của chính nó
                    // Sau đó sẽ tìm
                    let childIds = [id]
                    async function findAllParents(childIds, blackList = []) {
                        if (childIds.length === 0) {
                            return blackList
                        }
                        const children = await model.findAll({
                            attributes: ['id'],
                            where: {
                                [name]: {
                                    [Op.in]: childIds,
                                },
                            },
                        })
                        childIds = children.map((child) => child.id)
                        blackList = [...new Set([...blackList, ...childIds])]
                        return findAllParents(childIds, blackList)
                    }
                    const blackList = await findAllParents(childIds, [])
                    blackList.push(id)
                    // Lấy danh sách các id con

                    filters = {
                        where: {
                            id: {
                                [Op.notIn]: blackList,
                            },
                        },
                    }
                }

                const results = await model.findAll({
                    attributes: [valueKey, labelKey, parentName],
                    ...filters,
                })
                const arr = results.map((item) => {
                    return item.dataValues
                })

                const tree = buildTree(arr, null, 1, parentName, valueKey)
                return {
                    printTree,
                    tree,
                }
            },
            canBeDeleted: async (DB, id) => {
                // Muốn xóa thì phải không có thằng nào là con
                // Không có thằng nào liên kết với nó

                const data =
                    modelRelateTo.length > 0
                        ? await Promise.all(
                              modelRelateTo.map(async ({ model, field }) => {
                                  const count = await DB[model].findAll({
                                      attributes: ['id'],
                                      where: {
                                          [field]: id,
                                      },
                                  })
                                  return count.length === 0
                              })
                          )
                        : true

                return data.every((item) => item)
            },
            type: 'selectParentAssoc',
            modelName: modelName,
            valueKey: valueKey,
            labelKey: labelKey,
        }
    },
    chooseBeLongToMany: (
        modelName,
        valueKey,
        labelKey,
        parentName,
        fn,
        hasCheckLevel = false,
        modelRelateTo = [],
        
    ) => {
        return {
            type: 'chooseBeLongToMany',
            modelName: modelName,
            data: async (model) => {
                const results = await model.findAll({
                    attributes: [valueKey, labelKey, parentName],
                })
                const arr = results.map((item) => {
                    return item.dataValues
                })
                // Xây dựng cây từ danh sách dữ liệu ban đầu
                const tree = buildTree(arr, null, 1, parentName, valueKey)
                return {
                    printTreeChoose,
                    tree,
                }
            },
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
    }
}
