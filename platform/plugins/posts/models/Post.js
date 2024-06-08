'use strict'
const { Model } = require('sequelize')
const { chooseBeLongToMany } = require('../../../../utils/fields')
const { HAS_CHECK_LEVEL } = require('../../../../constants/model')
module.exports = (sequelize, DataTypes) => {
    class Post extends Model {
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
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                    filter: true,
                    sort: true,
                },
                {
                    name: 'slug',
                    label: 'Đường dẫn',
                    type: 'slug',
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                    filter: true,
                    sort: true,
                    slugDB: 'Link',
                    slugData: async (id, data, db) => {
                        const dataDB = {
                            controller:
                                '/platform/plugins/posts/controllers/posts.controller.js',
                            method: 'show',
                            model: 'Post',
                            model_id: id,
                            url: data,
                        }
                        await db.create(dataDB)
                    },
                },
                {
                    name: 'description',
                    label: 'Mô tả ngắn',
                    type: 'textarea',
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                    filter: true,
                    sort: true,
                },
                {
                    name: 'content',
                    label: 'Nội dung',
                    type: 'editor',
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                    filter: true,
                    sort: true,
                },
                {
                    name: 'image',
                    label: 'Ảnh đại diện',
                    type: 'image',
                    show: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: true,
                    filter: false,
                    sort: false,
                    order: 1,
                },
                {
                    name: 'seo_image',
                    label: 'Ảnh SEO',
                    type: 'image',
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                    filter: true,
                    sort: true,
                },
                {
                    name: 'seo_title',
                    label: 'Tiêu đề SEO',
                    type: 'text',
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                    filter: true,
                    sort: true,
                },
                {
                    name: 'seo_description',
                    label: 'Mô tả SEO',
                    type: 'textarea',
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                    filter: true,
                    sort: true,
                },
                {
                    name: 'seo_keywords',
                    label: 'Từ khóa SEO',
                    type: 'textarea',
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                    filter: true,
                    sort: true,
                },
                {
                    name: 'post_category_id',
                    label: 'Danh mục tin tức',
                    keyChild: 'child',
                    keyLabel: 'name',
                    keyValue: 'id',
                    ...chooseBeLongToMany(
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
                        ]
                    ),
                    show: false,
                    showForm: true,
                    positionSidebar: true,
                },
                {
                    name: 'status',
                    label: 'Trạng thái',
                    type: 'status',
                    show: true,
                    showForm: true,
                    positionSidebar: true,
                    // filter: true,
                    options: [
                        {
                            value: 1,
                            name: 'Kích Hoạt',
                        },
                        {
                            value: 0,
                            name: 'Tắt kích hoạt',
                        },
                    ],
                },
            ]
        }

        static validate(id = null) {
            let validate = {
                name: string().required('Vui lòng nhập tên'),
                content: string().required('Vui lòng nhập nội dung'),
            }
            return validate
        }
    }
    Post.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
            },
            name: {
                type: DataTypes.STRING,
            },
            slug: {
                type: DataTypes.STRING,
            },
            description: {
                type: DataTypes.TEXT,
            },
            content: {
                type: DataTypes.TEXT,
            },
            image: {
                type: DataTypes.TEXT,
            },
            gallery: {
                type: DataTypes.TEXT,
            },
            seo_image: {
                type: DataTypes.STRING,
            },
            seo_title: {
                type: DataTypes.STRING,
            },
            seo_description: {
                type: DataTypes.TEXT,
            },
            seo_keywords: {
                type: DataTypes.TEXT,
            },
            status: {
                type: DataTypes.BOOLEAN,
            },
        },
        {
            sequelize,
            modelName: 'Post',
            tableName: 'posts',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return Post
}
