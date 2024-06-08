'use strict'
const { Model } = require('sequelize')
const { selectParentAssoc } = require('../../../../utils/fields')
const { HAS_CHECK_LEVEL } = require('../../../../constants/model')
module.exports = (sequelize, DataTypes) => {
    class PostCategory extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            PostCategory.hasMany(models.PostCategory, {
                foreignKey: 'post_category_id',
                as: 'children',
            })

            PostCategory.belongsToMany(models.Post, {
                foreignKey: 'post_category_id',
                through: 'post_post_category',
                otherKey: 'post_id',
                as: 'posts',
            })

            PostCategory.belongsTo(models.PostCategory, {
                foreignKey: 'post_category_id',
                as: 'postCategory',
            })
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
                    excel: {
                        label: 'Tên tin tức',
                        key: "name",
                        data: 'STRING',
                        width: 25
                    },
                },
                {
                    name: 'post_category_id',
                    label: 'Danh mục cha',
                    type: 'text',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                    keyValue: 'id',
                    keyLabel: 'name',
                    keyChild: 'child',
                    ...selectParentAssoc(
                        'PostCategory',
                        'id',
                        'name',
                        'post_category_id',
                        HAS_CHECK_LEVEL,
                        [
                            {
                                model: 'PostPostCategory',
                                field: 'post_category_id',
                            },
                            {
                                model: 'PostCategory',
                                field: 'post_category_id',
                            },
                        ]
                    ),
                    include: [
                        {
                            model: 'PostCategory',
                            as: 'postCategory',
                        },
                    ],
                    excel:{
                        label: 'Danh mục cha',
                        key: "post_category_id",
                        data: 'ID',
                        width: 25
                    }
                },
            ]
        }
        static validate(id) {
            let validate = {}
            return validate
        }
    }
    PostCategory.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
            },
            name: {
                type: DataTypes.STRING,
            },
            post_category_id: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'PostCategory',
            tableName: 'post_categories',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return PostCategory
}
