'use strict'
const { Model, Op } = require('sequelize')
const { string } = require('yup')
const { chooseMultiAssoc, selectParentAssoc } = require('../utils/fields')
const { NO_CHECK_LEVEL } = require('../constants/model')
const DB = require('./index')
const i18n = require('i18n')
module.exports = (sequelize, DataTypes) => {
    class Module extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Module.belongsToMany(models.Permission, {
                foreignKey: 'module_id',
                through: 'module_permission',
                otherKey: 'permission_id',
                as: 'permissions',
            })

            Module.belongsTo(models.ManagerModule, {
                foreignKey: 'manager_module_id',
                as: 'managerModule',
            })
        }
        static fields() {
            return [
                {
                    name: 'name',
                    label: i18n.__('module.name'),
                    type: 'text',
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                },
                {
                    name: 'name_show',
                    label: i18n.__('module.name_show'),
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                    order: 1,
                },
                {
                    name: 'order',
                    label: i18n.__('order'),
                    dataType: 'integer',
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                },
                {
                    name: 'model',
                    label: 'Model',
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                },
                // {
                //     name: 'active',
                //     label: 'Trạng thái',
                //     type: 'status',
                //     show: true,
                //     showForm: true,
                //     positionSidebar: true,
                //     options: [
                //         {
                //             value: 1,
                //             name: 'Kích Hoạt',
                //         },
                //         {
                //             value: 0,
                //             name: 'Tắt kích hoạt',
                //         },
                //     ],
                // },
                {
                    name: 'type',
                    label: i18n.__('module.type'),
                    type: 'select',
                    show: true,
                    keyValue: 'value',
                    keyShow: 'name',
                    options: [
                        {
                            value: 'sql',
                            name: 'SQL',
                        },
                        {
                            value: 'nosql',
                            name: 'NoSQL',
                        },
                    ],
                    showForm: true,
                    positionSidebar: true,
                    filter: false,
                    order: null, // null || number,
                },
                {
                    name: 'api',
                    label: 'API',
                    type: 'api',
                    show: true,
                    showForm: true,
                    positionSidebar: true,
                    options: [
                        {
                            value: 1,
                            name: i18n.__('active'),
                        },
                        {
                            value: 0,
                            name: i18n.__('inactive'),
                        },
                    ],
                },
                {
                    name: 'public_api',
                    label: 'API NO TOKEN',
                    type: 'api',
                    show: true,
                    showForm: true,
                    positionSidebar: true,
                    options: [
                        {
                            value: 1,
                            name: i18n.__('active'),
                        },
                        {
                            value: 0,
                            name: i18n.__('inactive'),
                        },
                    ],
                },
                {
                    name: 'permissions',
                    modelName: 'Permission',
                    modelAs: 'permissions',
                    ...chooseMultiAssoc(
                        'Permission',
                        'id',
                        'value',
                        'Permissions'
                    ),
                    label: i18n.__('module.permission'),
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                },
                {
                    name: 'manager_module_id',
                    label: i18n.__('module.parent'),
                    type: 'selectParentAssoc',
                    keyValue: 'id',
                    keyLabel: 'name',
                    keyChild: 'child',
                    ...selectParentAssoc(
                        'ManagerModule',
                        'id',
                        'name',
                        'manager_module_id',
                        NO_CHECK_LEVEL
                    ),
                    include: [
                        {
                            model: 'ManagerModule',
                            as: 'managerModule',
                        },
                    ],
                    show: true,
                    showForm: true,
                    positionSidebar: true,
                    order: 3,
                },
                {
                    name: 'icon',
                    label: i18n.__('icon'),
                    type: 'icon',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                    order: 1,
                },
            ]
        }
        static filter() {
            return {
                active: true,
            }
        }
        static validate(id) {
            const validate = {
                name: string()
                    .required(i18n.__('required', { name: 'Key'}))
                    .test('check-user', i18n.__('exist', { name: i18n.__('module') }), async (value) => {
                        const result = id
                            ? await Module.findOne({
                                  where: {
                                      name: value,
                                      id: {
                                          [Op.not]: id,
                                      },
                                  },
                              })
                            : await Module.findOne({
                                  where: {
                                      name: value,
                                  },
                              })
                        return !result
                    }),
            }
            return validate
        }
    }
    Module.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: DataTypes.STRING,
            name_show: DataTypes.STRING,
            order: DataTypes.INTEGER,
            type: DataTypes.STRING,
            model: DataTypes.STRING,
            active: DataTypes.BOOLEAN,
            api: DataTypes.BOOLEAN,
            public_api: DataTypes.BOOLEAN,
            type: DataTypes.STRING,
            manager_module_id: DataTypes.INTEGER,
            icon: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'Module',
            tableName: 'modules',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return Module
}
