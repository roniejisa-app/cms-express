'use strict';
const {
    Model, Op
} = require('sequelize');
const { string } = require('yup');
const i18n = require('i18n')
module.exports = (sequelize, DataTypes) => {
    class Permission extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Permission.belongsToMany(models.Module, {
                foreignKey: "permission_id",
                otherKey: "module_id",
                through: "module_permission",
                as: "modules"
            })
        }

        static fields() {
            return [
                {
                    name: 'value',
                    label: i18n.__('permission.value'),
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false
                },
                {
                    name: 'name',
                    label: i18n.__('permission.name'),
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                }
            ]
        }

        static validate(id = null) {
            const validate = {
                value: string().required(i18n.__('permission.value')).matches(/[a-z]/, {
                    message: i18n.__('permission.incorrect_format')
                }).test('check-name', i18n.__('permission.exist'), async (value) => {
                    const result = id ? await Permission.findOne({
                        where: {
                            value,
                            id: {
                                [Op.not]: id
                            }
                        }
                    }) : await Permission.findOne({
                        where: {
                            value
                        }
                    });
                    return !result;
                }),
                name: string().required(i18n.__('required', { name: i18n.__('permission.name') }))
            }
            return validate;
        }
    }
    Permission.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },  
        value: DataTypes.STRING,
        name: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Permission',
        tableName: "permissions",
        createdAt: "created_at",
        updatedAt: "updated_at"
    });
    return Permission;
};