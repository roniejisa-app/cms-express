'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class chatRoom extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            chatRoom.belongsToMany(models.User, {
                through: "chat_room_user",
                foreignKey: "chat_room_id",
                otherKey: "user_id",
                as: "users"
            })
        }
    }
    chatRoom.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'chatRoom',
        tableName: "chat_rooms",
        createdAt: false,
        updatedAt: false,
    });
    return chatRoom;
};