'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class UserToken extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.UserToken.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
            })
        }
    }
    UserToken.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            user_id: DataTypes.INTEGER,
            refresh_token: DataTypes.TEXT,
            user_agent: DataTypes.TEXT,
            ip_address: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'UserToken',
            tableName: 'user_tokens',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return UserToken
}
