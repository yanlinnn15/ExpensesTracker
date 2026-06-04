const { Budgets, Categories, Icons, Transactions } = require('../models');
const { Op, fn, col } = require('sequelize');

const create = async (userId, { amount, remark, CategoryId }) => {
    const exists = await Budgets.findOne({ where: { CategoryId } });
    if (exists) return { conflict: true };

    await Budgets.create({ amount, remark, CategoryId, UserId: userId });
    return { ok: true };
};

const getAll = async (userId) => {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01`);
    const endOfYear   = new Date(`${currentYear}-12-31`);

    const budgets = await Budgets.findAll({
        where: { UserId: userId },
        include: [{ model: Categories, include: [{ model: Icons }] }],
    });

    if (!budgets || budgets.length === 0) return null;

    const categoryIds = budgets.map(b => b.CategoryId);

    const transactions = await Transactions.findAll({
        attributes: ['CategoryId', [fn('SUM', col('amount')), 'totalAmount']],
        where: {
            UserId: userId,
            CategoryId: { [Op.in]: categoryIds },
            date: { [Op.between]: [startOfYear, endOfYear] },
        },
        group: [col('CategoryId')],
    });

    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);

    const totalAmount = await Transactions.sum('amount', {
        where: {
            UserId: userId,
            CategoryId: { [Op.in]: categoryIds },
            date: { [Op.between]: [startOfYear, endOfYear] },
        },
    });

    const transMap = {};
    transactions.forEach(t => { transMap[t.CategoryId] = parseFloat(t.dataValues.totalAmount); });

    const budgetTrans = budgets.map(b => ({
        ...b.toJSON(),
        totalSpent: transMap[b.Category?.id] || 0,
    }));

    return { totalBudget, totalAmount, budgetTrans };
};

const remove = async (id) => {
    const budget = await Budgets.findByPk(id);
    if (!budget) return false;
    await budget.destroy();
    return true;
};

const update = async (id, { amount, remark }) => {
    const budget = await Budgets.findByPk(id);
    if (!budget) return null;
    if (amount !== undefined) budget.amount = amount;
    if (remark !== undefined) budget.remark = remark;
    await budget.save();
    return budget;
};

module.exports = { create, getAll, remove, update };
