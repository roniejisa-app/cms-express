'use strict'
const { Model } = require('sequelize')
const { chooseBeLongToMany, selectAssoc } = require('../../../../utils/fields')
const { HAS_CHECK_LEVEL } = require('../../../../constants/model')
module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Product.belongsToMany(models.ProductCategory, {
                through: 'product_product_category',
                foreignKey: 'product_id',
                otherKey: 'product_category_id',
                as: 'productCategories',
            })

            Product.belongsTo(models.ProductBrand, {
                foreignKey: 'product_brand_id',
                as: 'productBrand',
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
                    order: 1,
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
                                '/platform/plugins/ecommerce/controllers/products.controller.js',
                            method: 'show',
                            model: 'Product',
                            model_id: id,
                            url: data,
                        }
                        await db.create(dataDB)
                    },
                    order: 2,
                },
                {
                    name: 'description',
                    label: 'Thông tin sản phẩm',
                    type: 'textarea',
                    show: false,
                    sort: false,
                    filter: false,
                    showForm: true,
                    filterDefault: false,
                    positionSidebar: false,
                },
                {
                    name: 'image',
                    label: 'Ảnh đại diện',
                    type: 'image',
                    show: true,
                    sort: false,
                    filter: false,
                    showForm: true,
                    filterDefault: false,
                    positionSidebar: true,
                },
                {
                    name: 'images',
                    label: 'Thư viện ảnh',
                    type: 'gallery',
                    show: false,
                    sort: true,
                    filter: false,
                    showForm: true,
                    filterDefault: false,
                    positionSidebar: false,
                    order: 10,
                },
                {
                    name: 'highlight',
                    label: 'Đặc điểm nổi bật',
                    type: 'editor',
                    show: false,
                    sort: true,
                    filter: false,
                    showForm: true,
                    filterDefault: false,
                    positionSidebar: false,
                },
                {
                    name: 'specification',
                    label: 'Thông số kỹ thuật',
                    type: 'editor',
                    show: false,
                    sort: false,
                    filter: false,
                    showForm: true,
                    filterDefault: false,
                    positionSidebar: false,
                },
                {
                    name: 'endow',
                    label: 'Ưu đãi',
                    type: 'editor',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                },
                {
                    name: 'hot',
                    label: 'HOT',
                    type: 'text',
                    show: true,
                    sort: false,
                    filter: false,
                    showForm: true,
                    filterDefault: false,
                    positionSidebar: true,
                },
                {
                    name: 'new',
                    label: 'Mới',
                    type: 'text',
                    show: true,
                    sort: false,
                    filter: false,
                    showForm: true,
                    filterDefault: false,
                    positionSidebar: true,
                },
                {
                    name: 'product_brand_id',
                    label: 'Thương hiệu sản phẩm',
                    ...selectAssoc('ProductBrand', 'id', 'name'),
                    show: false,
                    showForm: true,
                    positionSidebar: true,
                    // filter: true,
                },
                {
                    name: 'product_category_id',
                    label: 'Danh mục sản phẩm',
                    modelName: 'ProductCategory',
                    modelAs: 'productCategories',
                    modelKey: 'id',
                    keyChild: 'child',
                    keyLabel: 'name',
                    keyValue: 'id',
                    ...chooseBeLongToMany(
                        'ProductCategory',
                        'id',
                        'name',
                        'product_category_id',
                        'ProductCategories'
                        // HAS_CHECK_LEVEL,
                        // [
                        //     {
                        //         model: 'ProductProductCategory',
                        //         field: 'product_category_id',
                        //     },
                        // ]
                    ),
                    show: false,
                    showForm: true,
                    positionSidebar: true,
                },
                {
                    name: 'product_variant',
                    label: 'Biến thể sản phẩm',
                    type: 'ecommerce|product_variant',
                    show: false,
                    showForm: true,
                    order: 1
                },
                {
                    name: 'shipping',
                    label: 'Shipping',
                    type: 'shipping',
                    show: false,
                    showForm: true,
                },
            ]
        }
        static validate(id) {
            let validate = {
                name: string().required('Vui điền tên'),
                slug: string().required('Vui điền đường dẫn'),
            }
            return validate
        }
    }
    Product.init(
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
            highlight: DataTypes.TEXT,
            specification: DataTypes.TEXT,
            product_brand_id: DataTypes.INTEGER,
            endow: DataTypes.TEXT,
            hot: DataTypes.BOOLEAN,
            new: DataTypes.BOOLEAN,
            product_brand_id: DataTypes.INTEGER,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
            seo_title: DataTypes.STRING,
            seo_description: DataTypes.STRING,
            seo_keywords: DataTypes.STRING,
            seo_image: DataTypes.TEXT,
            price: DataTypes.DECIMAL,
            quantity: DataTypes.INTEGER,
            sku: DataTypes.STRING,
            variant: DataTypes.BOOLEAN
        },
        {
            sequelize,
            modelName: 'Product',
            tableName: 'products',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return Product
}
