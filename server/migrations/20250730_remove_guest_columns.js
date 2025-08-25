'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Transactions', 'createdByGuest');
    await queryInterface.removeColumn('Transactions', 'createdByGoogle');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Transactions', 'createdByGuest', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.addColumn('Transactions', 'createdByGoogle', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  }
};
