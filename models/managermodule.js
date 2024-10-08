'use strict'
const { Model } = require('sequelize')
const { string } = require('yup')
const { selectParentAssoc } = require('../utils/fields')
const { HAS_CHECK_LEVEL } = require('../constants/model')
const i18n = require('i18n')
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
                    label: i18n.__('manager_module.icon'),
                    type: 'icon',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                    order:999
                },
                {
                    name: 'name',
                    label: i18n.__('name'),
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                },
                {
                    name: 'manager_module_id',
                    label: i18n.__('manager_module.parent'),
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
                    include: [
                        {
                            model: 'ManagerModule',
                            as: 'parent',
                        },
                    ],
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                },
                {
                    name: 'order',
                    label: i18n.__('order'),
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                },
            ]
        }

        static validate() {
            const validate = {
                name: string().required(i18n.__('required', { name: i18n.__('name') })),
                order: string(),
                icon: string().required(i18n.__('required', { name: i18n.__('icon') })),
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
