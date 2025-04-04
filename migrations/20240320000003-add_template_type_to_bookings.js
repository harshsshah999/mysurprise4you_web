'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('bookings', 'template_type', {
      type: Sequelize.ENUM('immersive', 'split'),
      defaultValue: 'immersive',
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('bookings', 'template_type');
  }
}; 