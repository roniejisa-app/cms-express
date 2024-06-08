'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class PostPostCategory extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

        static fields() {
            return [
                {
                    name: 'name',
                    label: 'Tên',
                    type: 'text',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                },
            ]
        }
        static validate(id) {
            let validate = {}
            return validate
        }
    }
    PostPostCategory.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
            },
            post_category_id: DataTypes.INTEGER,
            post_id: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'PostPostCategory',
            tableName: 'post_post_category',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return PostPostCategory
}
