'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Crawl extends Model {
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
                    name: 'name',
                    label: 'Tên',
                    type: 'text',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                },
            ]
        }
        static validate(id) {
            let validate = {}
            return validate
        }
    }
    Crawl.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
            },
            name: {
                type: DataTypes.STRING,
            },
            setting: {
                type: DataTypes.TEXT,
            },
            url: {
                type: DataTypes.STRING,
            },
            active: {
                type: DataTypes.BOOLEAN,
            },
            page:{
                type: DataTypes.INTEGER
            }
        },
        {
            sequelize,
            modelName: 'Crawl',
            tableName: 'crawls',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return Crawl
}
