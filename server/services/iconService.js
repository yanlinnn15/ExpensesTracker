const { Icons } = require('../models');

const create = async ({ icon_name, icon_class }) => {
    return await Icons.create({ icon_name, icon_class });
};

const getAll = async () => {
    return await Icons.findAll();
};

module.exports = { create, getAll };
