'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Icons', [
      { icon_class: 'IconMoneybag', icon_name: 'Money Bag', createdAt: new Date(), updatedAt: new Date() },
      { icon_class: 'IconCoin', icon_name: 'Coin', createdAt: new Date(), updatedAt: new Date() },
      { icon_class: 'IconCash', icon_name: 'Cash', createdAt: new Date(), updatedAt: new Date() },
      { icon_class: 'IconBuildingBank', icon_name: 'Bank', createdAt: new Date(), updatedAt: new Date() },
      { icon_class: 'IconPigMoney', icon_name: 'Savings', createdAt: new Date(), updatedAt: new Date() },
      { icon_class: 'IconShoppingCart', icon_name: 'Shopping', createdAt: new Date(), updatedAt: new Date() },
      { icon_class: 'IconShirt', icon_name: 'Clothing', createdAt: new Date(), updatedAt: new Date() },
      { icon_class: 'IconHome', icon_name: 'Home', createdAt: new Date(), updatedAt: new Date() },
      { icon_class: 'IconCar', icon_name: 'Transport', createdAt: new Date(), updatedAt: new Date() },
      { icon_class: 'IconDevices', icon_name: 'Electronics', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Icons', null, {});
  }
};
