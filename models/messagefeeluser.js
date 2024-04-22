'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class MessageFeelUser extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            MessageFeelUser.belongsTo(models.Message, {
                foreignKey: "message_id",
                as: "message"
            })

            MessageFeelUser.belongsTo(models.User, {
                foreignKey: "user_id",
                as: "user"
            })
        }
    }
    MessageFeelUser.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        message_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        native: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'MessageFeelUser',
        tableName: 'message_feel_users',
        createdAt: "created_at",
        updatedAt: "updated_at"
    });
    return MessageFeelUser;
};