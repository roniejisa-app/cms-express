'use strict'
const { Op } = require('sequelize')
const { Model } = require('sequelize')
const { string } = require('yup')
const i18n = require('i18n')
module.exports = (sequelize, DataTypes) => {
    class Language extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Language.hasMany(models.Word, {
                foreignKey: 'code',
                sourceKey: 'code',
                as: 'words',
            })
        }
        static fields() {
            return [
                {
                    name: 'name',
                    label: i18n.__('language.name'),
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
                    label: i18n.__('language.code'),
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
                    label: i18n.__('language.default'),
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
                    label: i18n.__('language.active'),
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
                name: string().required(i18n.__('required', { name: i18n.__('language.name') })),
                code: string()
                    .required(i18n.__('required', { name: i18n.__('language.code') }))
                    .test('check-code', i18n.__('exists', { name: i18n.__('language.code') }), async (value) => {
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
