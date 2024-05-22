'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Link extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Link.init(
        {
            id: {
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            url: DataTypes.STRING,
            model: DataTypes.STRING,
            model_id: DataTypes.INTEGER,
            controller: DataTypes.STRING,
            method: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'Link',
            tableName: 'links',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return Link
}
