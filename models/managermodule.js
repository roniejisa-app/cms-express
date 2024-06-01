'use strict'
const { Model } = require('sequelize')
const { string } = require('yup')
const { selectParentAssoc } = require('../utils/fields')
const { HAS_CHECK_LEVEL } = require('@constants/model')

module.exports = (sequelize, DataTypes) => {
    class ManagerModule extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ManagerModule.belongsTo(models.ManagerModule, {
                foreignKey: 'manager_module_id',
                as: 'parent',
            })

            ManagerModule.hasMany(models.ManagerModule, {
                foreignKey: 'manager_module_id',
                as: 'children',
            })

            ManagerModule.hasMany(models.Module, {
                foreignKey: 'manager_module_id',
                as: 'modules',
            })
        }

        static fields() {
            return [
                {
                    name: 'icon',
                    label: 'Icon',
                    type: 'image',
                    show: true,
                    showForm: true,
                    positionSidebar: true,
                },
                {
                    name: 'name',
                    label: 'Tên',
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                },
                {
                    name: 'manager_module_id',
                    label: 'Module cha',
                    type: 'selectParentAssoc',
                    keyValue: 'id',
                    keyLabel: 'name',
                    keyChild: 'child',
                    
                    ...selectParentAssoc(
                        'ManagerModule',
                        'id',
                        'name',
                        'manager_module_id',
                        HAS_CHECK_LEVEL,
                        [
                            {
                                model: 'Module',
                                field: 'manager_module_id',
                            },
                            {
                                model: 'ManagerModule',
                                field: 'manager_module_id',
                            },
                        ]
                    ),
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                },
                {
                    name: 'order',
                    label: 'Thứ tự',
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                },
            ]
        }

        static validate() {
            const validate = {
                name: string().required('Vui điền tên'),
                order: string(),
                icon: string().required('Vui lòng nhập hình ảnh'),
            }
            return validate
        }
    }
    ManagerModule.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            icon: DataTypes.STRING,
            name: DataTypes.STRING,
            manager_module_id: DataTypes.INTEGER,
            order: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'ManagerModule',
            tableName: 'manager_modules',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return ManagerModule
}
