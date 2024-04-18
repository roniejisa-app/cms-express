'use strict';
const {
    Model
} = require('sequelize');
const { string } = require('yup');
module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        static associate(models) {
            Role.belongsToMany(models.User, {
                foreignKey: "role_id",
                otherKey: "user_id",
                through: "role_user",
                as: "users"
            })

            Role.belongsToMany(models.Permission, {
                foreignKey: "role_id",
                through: "role_permission",
                as: "permissions",
                otherKey: "permission_id"
            })

            Role.belongsToMany(models.ModulePermission, {
                foreignKey: "role_id",
                through: "role_module_permission",
                otherKey: "module_permission_id",
                as: "modulePermissions"
            })

            Role.hasMany(models.RoleModulePermission, {
                foreignKey: 'role_id',
                as: 'roleModulePermissions'
            })
        }

        static fields() {
            return [
                {
                    name: 'name',
                    label: 'Tên',
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false
                },
                {
                    name: "roles",
                    type: "permissions",
                    label: "Quyền",
                    modelName: "Module",
                    modelAssoc: "Permission",
                    modelModulePermission: "ModulePermission",
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
                                    as: 'modulePermission'
                                }
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
                                }
                            ]
                        })
                    },
                    addOrEditPermission: async (item, model, data, mainKey, subKey, fn, idAdd = true) => {
                        let newData = await Promise.all(data.map(async function (item) {
                            if(item){
                                const [mainId, subId] = item.split('|');
                                const filter = {};
                                filter[mainKey] = mainId;
                                filter[subKey] = subId;
                                return model.findOne({
                                    where: filter
                                });
                            }
                            return false;
                        }));

                        if(Array.isArray(newData)){
                            newData = newData.filter(data => data);
                        }

                        fn = (idAdd ? 'add' : 'set') + fn;
                        await item[fn](newData);
                    },
                    mainKey: 'module_id',
                    subKey: 'permission_id',
                    fn: 'ModulePermissions',
                    valueKey: 'id',
                    labelKey: 'name_show',
                    asModelAssoc: "permissions",
                    valueKeyOfAssoc: 'id',
                    labelKeyOfAssoc: 'name',
                    show: false,
                    showForm: true,
                    positionSidebar: false
                }
            ]
        }

        static validate() {
            const validate = {
                name: string().required("Vui lòng nhập tên")
            }
            return validate;
        }
    }
    Role.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Role',
        tableName: "roles",
        createdAt: "created_at",
        updatedAt: "updated_at"
    });
    return Role;
};