'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Course extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Course.belongsToMany(models.User, {
                through: "course_user",
                foreignKey: "course_id",
                otherKey: "user_id",
                as: "users"
            })
        }
    }
    Course.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: DataTypes.STRING,
        price: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Course',
        tableName: "courses",
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return Course;
};