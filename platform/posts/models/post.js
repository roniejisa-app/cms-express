'use strict';
const {
    Model, Op
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Post extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            
        }
    }
    Post.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: DataTypes.STRING,
        name_show: DataTypes.STRING,
        order: DataTypes.INTEGER,
        model: DataTypes.STRING,
        active: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Post',
        tableName: "posts",
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
    return Post;
};