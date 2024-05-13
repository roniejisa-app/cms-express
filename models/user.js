'use strict'
const { Model, Op } = require('sequelize')
const { string } = require('yup')
const db = require('./index')
const { selectAssoc, chooseMultiAssoc } = require('../utils/fields')
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            User.hasOne(models.Phone, {
                foreignKey: 'user_id',
                as: 'phone',
            })

            User.belongsToMany(models.Role, {
                foreignKey: 'user_id',
                through: 'user_role',
                otherKey: 'role_id',
                as: 'roles',
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE',
            })

            User.belongsToMany(models.Permission, {
                foreignKey: 'user_id',
                through: 'user_permission',
                as: 'permissions',
                otherKey: 'permission_id',
            })

            User.belongsToMany(models.chatRoom, {
                through: 'chat_room_user',
                foreignKey: 'user_id',
                otherKey: 'chat_room_id',
                as: 'chatRooms',
            })

            User.hasMany(models.chatRoom, {
                foreignKey: 'user_id',
                as: 'chatRoomOfUsers',
            })

            User.belongsTo(models.Provider, {
                foreignKey: 'provider_id',
                as: 'provider',
            })
        }

        static fields() {
            return [
                {
                    name: 'fullname',
                    label: 'Tên',
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                    filter: true,
                },
                {
                    name: 'email',
                    label: 'Email',
                    type: 'text',
                    show: true,
                    showForm: true,
                    positionSidebar: false,
                    filter: true,
                },
                {
                    name: 'password',
                    label: 'Mật khẩu',
                    type: 'password',
                    show: false,
                    showForm: true,
                    hash: true,
                    positionSidebar: false,
                },
                {
                    name: 'status',
                    label: 'Trạng thái',
                    type: 'status',
                    show: true,
                    showForm: true,
                    positionSidebar: true,
                    // filter: true,
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
                    name: 'provider_id',
                    ...selectAssoc('Provider', 'id', 'name'),
                    label: 'Đăng nhập qua',
                    show: false,
                    showForm: true,
                    positionSidebar: true,
                    // filter: true,
                },
                {
                    name: 'roles',
                    label: 'Vai trò',
                    ...chooseMultiAssoc('Role', 'id', 'name', 'Roles'),
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                    // filter: true,
                },
                {
                    name: 'avatar',
                    label: 'Ảnh đại diện',
                    type: 'image',
                    show: true,
                    showForm: true,
                    positionSidebar: true,
                    order: 1,
                },
            ]
        }
        static validate(id = null) {
            let validate = {
                fullname: string().required('Vui lòng nhập tên'),
                email: string()
                    .required('Vui lòng nhập email')
                    .email('Không đúng định dạng email')
                    .test('check-email', 'Email đã tồn tại', async (value) => {
                        const result = id
                            ? await User.findOne({
                                  where: {
                                      email: value,
                                      id: {
                                          [Op.not]: id,
                                      },
                                  },
                              })
                            : await User.findOne({
                                  where: {
                                      email: value,
                                  },
                              })
                        return !result
                    }),
                status: string().test(
                    'check-status',
                    'Trạng thái không hợp lệ',
                    (value) => {
                        return +value === 0 || +value === 1
                    }
                ),
            }
            if (!id) {
                validate.password = string()
                    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
                    .required('Vui lòng nhập mật khẩu')
            }
            return validate
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            fullname: DataTypes.STRING,
            email: DataTypes.STRING,
            status: DataTypes.BOOLEAN,
            password: DataTypes.STRING,
            reset_token: DataTypes.STRING,
            provider_id: DataTypes.INTEGER,
            avatar: DataTypes.STRING,
            banner: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users', // Tên table trong Database
            //Mặc định sequelize sẽ tự động khai báo trường createdAt và updatedAt
            //Nếu muốn vô hiệu hóa 2 trường này, khai báo (timestamps: false)
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            // deletedAt: 'deleted_at',
            // paranoid: true // Kích hoạt xóa mềm (timestamps: true)
        }
    )
    return User
}
