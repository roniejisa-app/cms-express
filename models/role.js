'use strict';
const {
    Model
} = require('sequelize');
const { string } = require('yup');
const { choosePermission } = require('../utils/fields');
const i18n = require('i18n')
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
                    label: i18n.__('name'),
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false
                },
                {
                    name: "roles",
                    type: "permissions",
                    label: i18n.__('roles.permissions'),
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                    ...choosePermission()
                }
            ]
        }

        static validate() {
            const validate = {
                name: string().required(i18n.__('required', { name: i18n.__('name') })),
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