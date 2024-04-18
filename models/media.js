'use strict';
const { string } = require('yup');
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Media extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Media.hasMany(models.Media, {
                foreignKey: 'media_id',
                as: 'medias'
            })

            Media.belongsTo(models.Media, {
                foreignKey: 'media_id',
                as: 'folder'
            })
        }

        static validateFolder() {
            return {
                folderName: string().required('Vui lòng điền tên thư mục')
            }
        }
    }
    Media.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        filename: DataTypes.STRING,
        path: DataTypes.STRING,
        path_absolute: DataTypes.STRING,
        media_id: DataTypes.INTEGER,
        customs: DataTypes.TEXT,
        is_file: DataTypes.BOOLEAN,
        extension: DataTypes.STRING,
        note: DataTypes.STRING,
        description: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Media',
        tableName: 'medias',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'delete_at',
        paranoid: true
    });
    return Media;
};