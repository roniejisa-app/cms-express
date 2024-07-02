'use strict'
/** @type {import('sequelize-cli').Migration} */
const { Sequelize } = require('sequelize')
module.exports = {
    async up({ context: queryInterface }) {
        await queryInterface.createTable('products', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: false
            },
            price: Sequelize.DECIMAL,
            price_sale: {
                type: Sequelize.DECIMAL,
                allowNull: true
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            image: Sequelize.TEXT,
            images: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            highlight: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            specification: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            endow: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            hot: {
                type: Sequelize.BOOLEAN,
                allowNull: true
            },
            new: {
                type: Sequelize.BOOLEAN,
                allowNull: true
            },
            product_brand_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false
            },
            created_at: {
                defaultValue: Sequelize.fn('NOW'),
                type: Sequelize.DATE,
            },
            updated_at: {
                defaultValue: Sequelize.fn('NOW'),
                type: Sequelize.DATE,
            }
        })
    },
    async down({ context: queryInterface }) {
        await queryInterface.dropTable('products')
    },
}
