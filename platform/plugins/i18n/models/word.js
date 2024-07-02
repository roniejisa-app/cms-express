'use strict'
const { Model } = require('sequelize')
const { selectAssoc } = require('../../../../utils/fields')
const { Op } = require('sequelize')
const { string } = require('yup')
module.exports = (sequelize, DataTypes) => {
    class Word extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {
            // define association here
            Word.belongsTo(models.Language, {
                foreignKey: 'code',
                as: 'language',
            })
        }

        static fields() {
            return [
                {
                    name: 'key',
                    label: 'Key',
                    type: 'text',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                },
                {
                    name: 'value',
                    label: 'Ghi nội',
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
                    label: 'Ngôn ngữ',
                    type: 'text',
                    show: true,
                    ...selectAssoc('Language', 'code', 'name'),
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                },
            ]
        }

        static validate(id = null, data = {}) {
            let validate = {
                key: string()
                    .required()
                    .test(
                        'check-key',
                        'Key thuộc ngôn ngữ đã tồn tại',
                        async (value) => {
                            const result = id
                                ? await Word.findOne({
                                      where: {
                                          key: value,
                                          code: data.code,
                                          id: {
                                              [Op.not]: id,
                                          },
                                      },
                                  })
                                : await Word.findOne({
                                      where: {
                                          key: value,
                                          code: data.code,
                                      },
                                  })
                            return !result
                        }
                    ),
                value: string().required(),
                code: string().required(),
            }
            return validate
        }
    }
    Word.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            key: DataTypes.STRING,
            value: DataTypes.STRING,
            code: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'Word',
            tableName: 'words',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return Word
}
