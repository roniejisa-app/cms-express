'use strict';
const {
    Model, Op
} = require('sequelize');
const { string } = require('yup');
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
                    label: 'Giá trị',
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false
                },
                {
                    name: 'name',
                    label: 'Tên quyền',
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                }
            ]
        }

        static validate(id = null) {
            const validate = {
                value: string().required("Vui lòng nhập mã").matches(/[a-z]/, {
                    message: "Không đúng định dạng!"
                }).test('check-name', "Quyền đã tồn tại", async (value) => {
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
                name: string().required("Vui lòng nhập tên quyền")
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