'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class SaleCost extends Model {
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
                {
                    name: 'data',
                    label: "Bảng tính giá",
                    type:"ecommerce|cost",
                    showForm: true,
                    show:true
                }
            ]
        }
        static validate(id) {
            let validate = {}
            return validate
        }
    }
    SaleCost.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
            },
            data: DataTypes.TEXT,
            name: DataTypes.STRING,
            cost: DataTypes.DECIMAL,
            price: DataTypes.DECIMAL,
        },
        {
            sequelize,
            modelName: 'SaleCost',
            tableName: 'sale_costs',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return SaleCost
}
