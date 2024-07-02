'use strict'
const { Op } = require('sequelize')
const { Model } = require('sequelize')
const { string } = require('yup')
module.exports = (sequelize, DataTypes) => {
    class Language extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static fields() {
            return [
                {
                    name: 'name',
                    label: 'Tên ngôn ngã',
                    type: 'text',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                },
                {
                    name: 'code',
                    label: 'Kí hiệu',
                    type: 'text',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                },
                {
                    name: 'default',
                    label: 'Mặc định',
                    type: 'switch-one',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: true,
                },
                {
                    name: 'active',
                    label: 'Kích hoạt',
                    type: 'switch-one',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: true,
                },
            ]
        }

        static validate(id = null) {
            let validate = {
                name: string().required('Vui điền tên'),
                code: string()
                    .required('Vui lòng điền code')
                    .test('check-code', 'Code đã tồn tại', async (value) => {
                        const result = id
                            ? await Language.findOne({
                                  where: {
                                      code: value,
                                      id: {
                                          [Op.not]: id,
                                      },
                                  },
                              })
                            : await Language.findOne({
                                  where: {
                                      code: value,
                                  },
                              })
                        return !result
                    }),
                default: string().test(
                    'check-default',
                    'Thay đổi mặc định',
                    async (value) => {
                        if (+value === 1) {
                            const language = await Language.findOne({
                                where: {
                                    default: true,
                                    id: {
                                        [Op.not]: id,
                                    },
                                },
                            })
                            if (language) {
                                language.default = false
                                await language.save()
                            }
                            return true
                        }
                    }
                ),
            }
            return validate
        }
        static associate(models) {
            // define association here
        }
    }
    Language.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: DataTypes.STRING,
            code: DataTypes.STRING,
            default: DataTypes.BOOLEAN,
            active: DataTypes.BOOLEAN,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: 'Language',
            tableName: 'languages',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return Language
}