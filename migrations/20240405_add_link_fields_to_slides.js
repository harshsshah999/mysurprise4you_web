'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('slides', 'link_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('slides', 'link_title', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('slides', 'link_url');
    await queryInterface.removeColumn('slides', 'link_title');
  }
}; 