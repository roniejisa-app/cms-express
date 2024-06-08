'use strict'
/** @type {import('sequelize-cli').Migration} */
const { Sequelize } = require('sequelize')
module.exports = {
    async up({ context: queryInterface }) {
        await queryInterface.createTable('posts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: Sequelize.STRING,
            slug: Sequelize.STRING,
            content: Sequelize.TEXT,
            description: Sequelize.STRING,
            image: Sequelize.TEXT,
            gallery: Sequelize.TEXT,
            custom_form: Sequelize.TEXT,
            seo_title: Sequelize.STRING,
            seo_description: Sequelize.TEXT,
            seo_keywords: Sequelize.STRING,
            seo_image: Sequelize.TEXT,
            status: Sequelize.BOOLEAN,
            created_at: {
                defaultValue: Sequelize.fn('NOW'),
                type: Sequelize.DATE,
            },
            updated_at: {
                defaultValue: Sequelize.fn('NOW'),
                type: Sequelize.DATE,
            },
        })
    },
    async down({ context: queryInterface }) {
        await queryInterface.dropTable('posts')
    },
}
