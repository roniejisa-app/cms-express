'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Post extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Post.belongsTo(models.User, {
                foreignKey: "user_id",
                as:"user"
            })
        }
    }
    Post.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: DataTypes.STRING,
        content: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Post',
        tableName: 'posts',
        createdAt:'created_at',
        updatedAt: 'updated_at'
    });
    return Post;
};