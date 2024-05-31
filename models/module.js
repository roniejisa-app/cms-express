'use strict'
const { Model, Op } = require('sequelize')
const { string } = require('yup')
const { chooseMultiAssoc } = require('../utils/fields')
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
        }
        static fields() {
            return [
                {
                    name: 'name',
                    label: 'Key',
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                },
                {
                    name: 'name_show',
                    label: 'Tên hiển thị',
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                },
                {
                    name: 'order',
                    label: 'Thứ tự',
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
                {
                    name: 'active',
                    label: 'Trạng thái',
                    type: 'status',
                    show: true,
                    showForm: true,
                    positionSidebar: true,
                    options: [
                        {
                            value: 1,
                            name: 'Kích Hoạt',
                        },
                        {
                            value: 0,
                            name: 'Tắt kích hoạt',
                        },
                    ],
                },
                {
                    name: 'type',
                    label: 'Loại cơ sở dữ liệu',
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
                            name: 'Kích Hoạt',
                        },
                        {
                            value: 0,
                            name: 'Tắt kích hoạt',
                        },
                    ],
                },
                {
                    name: 'permissions',
                    ...chooseMultiAssoc(
                        'Permission',
                        'id',
                        'value',
                        'Permissions'
                    ),
                    label: 'Quyền',
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                },
            ]
        }
        static validate(id) {
            const validate = {
                model: string().required('Vui lòng nhập Model'),
                name: string()
                    .required('Vui lòng nhập Key')
                    .test('check-user', 'Key đã tồn tại!', async (value) => {
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
            type: DataTypes.STRING,
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
