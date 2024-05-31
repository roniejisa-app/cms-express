'use strict'
const { Model } = require('sequelize')
const Index = require('@models/index')
module.exports = (sequelize, DataTypes) => {
    class Page extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

        static fields() {
            return [
                {
                    name: 'url',
                    label: 'Đường dẫn',
                    type: 'slug',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                    slugDB: 'Link',
                    slugData: async (id, data, db) => {
                        const dataDB = {
                            controller:
                                '/platform/plugins/pages/controllers/page.controller.js',
                            method: 'show',
                            model: 'Page',
                            model_id: id,
                            url: data,
                        }
                        await db.create(dataDB)
                    },
                },
            ]
        }
        static validate(id) {
            let validate = {}
            return validate
        }
    }
    Page.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
            },
            url: DataTypes.STRING
        },
        {
            sequelize,
            modelName: 'Page',
            tableName: 'pages',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return Page
}
