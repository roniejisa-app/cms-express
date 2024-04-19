'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class MessageAdmin extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    MessageAdmin.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        message: {
            type: DataTypes.TEXT
        }
    }, {
        sequelize,
        modelName: 'MessageAdmin',
        tableName: "message_admins",
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
    return MessageAdmin;
};