const { Categories, Icons, Transactions, Budgets } = require('../models');
const { Op } = require('sequelize');

const create = async (userId, { name, IconId, is_income }) => {
    return await Categories.create({ name, IconId, is_income, UserId: userId });
};

const update = async (id, { name, IconId, is_income }) => {
    const category = await Categories.findByPk(id);
    if (!category) return null;
    if (name      !== undefined) category.name      = name;
    if (IconId    !== undefined) category.IconId    = IconId;
    if (is_income !== undefined) category.is_income = is_income;
    await category.save();
    return category;
};

const getAll = async (userId) => {
    const cate = await Categories.findAll({
        where: { UserId: userId },
        include: [{ model: Icons }],
    });

    const cateincome  = await Categories.findAll({ where: { UserId: userId, is_income: 1 }, include: [{ model: Icons }] });
    const cateexpense = await Categories.findAll({ where: { UserId: userId, is_income: 0 }, include: [{ model: Icons }] });

    const catebudgetRaw = await Categories.findAll({
        where: { UserId: userId, is_income: 0 },
        include: [
            { model: Icons },
            { model: Budgets, where: { UserId: userId }, required: false },
        ],
    });
    const catebudget = catebudgetRaw.filter(c => !c.Budgets || c.Budgets.length === 0);

    return { cate, cateincome, cateexpense, catebudget };
};

const getById = async (id) => {
    return await Categories.findOne({ where: { id }, include: [{ model: Icons }] });
};

const getOthersByType = async (id, userId) => {
    const cate = await Categories.findOne({ where: { id } });
    if (!cate) return null;
    return await Categories.findAll({
        where: { is_income: cate.is_income, id: { [Op.ne]: id }, UserId: userId },
        include: [{ model: Icons }],
    });
};

const remove = async (id) => {
    const category = await Categories.findByPk(id);
    if (!category) return false;
    await Transactions.destroy({ where: { CategoryId: id } });
    await Budgets.destroy({ where: { CategoryId: id } });
    await category.destroy();
    return true;
};

const countByCategory = async (userId, categoryId) => {
    return await Transactions.findAndCountAll({
        where: { UserId: userId, CategoryId: categoryId },
        include: [{ model: Categories, include: [{ model: Icons }] }],
    });
};

module.exports = { create, update, getAll, getById, getOthersByType, remove, countByCategory };
