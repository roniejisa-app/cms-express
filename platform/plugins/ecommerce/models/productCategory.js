'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class ProductCategory extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ProductCategory.belongsToMany(models.Product, {
                through: 'product_product_category',
                foreignKey: 'product_category_id',
                otherKey: 'product_id',
                as: 'products',
            })

            ProductCategory.belongsTo(models.ProductCategory, {
                foreignKey: 'product_category_id',
                as: 'parent',
            })

            ProductCategory.hasMany(models.ProductCategory, {
                foreignKey: 'product_category_id',
                as: 'children',
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
                },
                {
                    name: 'slug',
                    label: 'Đường dẫn',
                    type: 'slug',
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                    filter: false,
                    sort: false,
                    slugDB: 'Link',
                    slugData: async (id, data, db) => {
                        const dataDB = {
                            controller:
                                '/platform/plugins/ecommerce/controllers/productCategory.controller.js',
                            method: 'show',
                            model: 'ProductCategory',
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
                    name: 'image',
                    label: 'Hình ảnh',
                    type: 'image',
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                    filter: true,
                    sort: true,
                },
                {
                    name: 'images',
                    label: 'Thư viện ảnh',
                    type: 'gallery',
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                    filter: true,
                    sort: true,
                },
                {
                    name: 'product_category_id',
                    label: 'Danh mục cha',
                    type: 'selectParentAssoc',
                    keyValue: 'id',
                    keyLabel: 'name',
                    keyChild: 'child',
                    ...selectParentAssoc(
                        'ProductCategory',
                        'id',
                        'name',
                        'product_category_id',
                        HAS_CHECK_LEVEL,
                        [
                            {
                                model: 'ProductCategory',
                                field: 'product_category_id',
                            },
                        ]
                    ),
                    include: [
                        {
                            model: 'ProductCategory',
                            as: 'parent',
                        },
                    ],
                    show: false,
                    showForm: true,
                    positionSidebar: false,
                },
            ]
        }
        static validate(id) {
            let validate = {}
            return validate
        }
    }
    ProductCategory.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
            },
            name: DataTypes.STRING,
            slug: DataTypes.STRING,
            description: DataTypes.TEXT,
            image: DataTypes.TEXT,
            images: DataTypes.TEXT,
            product_category_id: DataTypes.INTEGER,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: 'ProductCategory',
            tableName: 'product_categories',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return ProductCategory
}
