'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ModulePermission extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ModulePermission.belongsToMany(models.Role, {
                foreignKey: "module_permission_id",
                otherKey: 'role_id',
                through: 'role_module_permission',
                as: 'roles'
            })

            ModulePermission.belongsTo(models.Module, {
                foreignKey: 'module_id',
                as: "module"
            })

            ModulePermission.belongsTo(models.Permission, {
                foreignKey: 'permission_id',
                as: "permission"
            })
        }
    }
    ModulePermission.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        module_id: DataTypes.INTEGER,
        permission_id: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'ModulePermission',
        tableName: 'module_permission',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
    return ModulePermission;
};