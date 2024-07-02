'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class ProductAttribute extends Model {
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
    ProductAttribute.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
            },
            name: DataTypes.STRING,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: 'ProductAttribute',
            tableName: 'product_attributes',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return ProductAttribute
}
