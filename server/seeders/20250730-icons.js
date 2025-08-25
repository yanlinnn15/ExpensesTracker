'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Icons', [
      { icon_name: 'Money', icon_class: 'payments', createdAt: new Date(), updatedAt: new Date() },
      { icon_name: 'Work', icon_class: 'work', createdAt: new Date(), updatedAt: new Date() },
      { icon_name: 'Investment', icon_class: 'trending_up', createdAt: new Date(), updatedAt: new Date() },
      { icon_name: 'Gift', icon_class: 'card_giftcard', createdAt: new Date(), updatedAt: new Date() },
      { icon_name: 'Food', icon_class: 'restaurant', createdAt: new Date(), updatedAt: new Date() },
      { icon_name: 'Transport', icon_class: 'directions_car', createdAt: new Date(), updatedAt: new Date() },
      { icon_name: 'Shopping', icon_class: 'shopping_cart', createdAt: new Date(), updatedAt: new Date() },
      { icon_name: 'Entertainment', icon_class: 'movie', createdAt: new Date(), updatedAt: new Date() },
      { icon_name: 'Bills', icon_class: 'receipt', createdAt: new Date(), updatedAt: new Date() },
      { icon_name: 'Health', icon_class: 'local_hospital', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Icons', null, {});
  }
};
