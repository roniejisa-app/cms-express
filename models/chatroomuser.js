'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class chatRoomUser extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            chatRoomUser.belongsTo(models.User, {
                foreignKey: "user_id",
                as: "getUserRooms"
            })

            chatRoomUser.belongsTo(models.chatRoom, {
                foreignKey: "chat_room_id",
                as: "getChatRooms"
            })
        }
    }
    chatRoomUser.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        chat_room_id: {
            type: DataTypes.INTEGER
        },
        user_id: {
            type: DataTypes.INTEGER
        },
    }, {
        sequelize,
        modelName: 'chatRoomUser',
        tableName: "chat_room_user",
        createdAt: "created_at",
        updatedAt: "updated_at"
    });
    return chatRoomUser;
};