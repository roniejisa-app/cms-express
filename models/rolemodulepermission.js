'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class RoleModulePermission extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            RoleModulePermission.belongsTo(models.Role, {
                foreignKey: 'role_id',
                as: 'role'
            })

            RoleModulePermission.belongsTo(models.ModulePermission, {
                foreignKey: 'module_permission_id',
                as: 'modulePermission'
            })
        }
    }
    RoleModulePermission.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        role_id: DataTypes.INTEGER,
        module_permission_id: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'RoleModulePermission',
        tableName: 'role_module_permission',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
    return RoleModulePermission;
};