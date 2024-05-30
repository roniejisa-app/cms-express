'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('modules', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: Sequelize.STRING(50),
            name_show: Sequelize.STRING(100),
            order: Sequelize.INTEGER,
            model: Sequelize.STRING,
            api:Sequelize.STRING,
            type:Sequelize.STRING,
            active:Sequelize.BOOLEAN,
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Modules');
    }
};