const { Transactions, Categories, Icons } = require('../models');
const { Op, fn, col } = require('sequelize');

const create = async (userId, { date, amount, remark, CategoryId, type }) => {
    return await Transactions.create({ date, amount, remark, CategoryId, type, UserId: userId });
};

const getMonthly = async (userId, mth) => {
    const startDate = new Date(`${mth}-01`);
    const endDate   = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    const dateRange = { [Op.between]: [startDate, endDate] };
    const whereClause = { UserId: userId, date: dateRange };

    const withCatIcon = { model: Categories, include: [{ model: Icons }] };

    const transaction = await Transactions.findAll({
        where: whereClause,
        include: [withCatIcon],
        order: [['date', 'DESC']],
    });

    const latestTrans = await Transactions.findAll({
        where: { UserId: userId },
        include: [withCatIcon],
        order: [['updatedAt', 'DESC']],
        limit: 5,
    });

    const monthly = await Transactions.findAll({
        attributes: [
            [fn('YEAR',  col('date')), 'year'],
            [fn('MONTH', col('date')), 'month'],
            [fn('SUM',   col('amount')), 'totalAmount'],
            [col('type'), 'type'],
        ],
        where: whereClause,
        group: [fn('YEAR', col('date')), fn('MONTH', col('date')), 'CategoryId', 'type'],
        order: [[fn('YEAR', col('date')), 'DESC'], [fn('MONTH', col('date')), 'DESC']],
        include: [withCatIcon],
    });

    const ttlIncome  = await Transactions.sum('amount', { where: { ...whereClause, type: 1 } });
    const ttlExpense = await Transactions.sum('amount', { where: { ...whereClause, type: 0 } });

    return {
        transaction: transaction || [],
        latestTrans:  latestTrans  || [],
        monthly:      monthly      || [],
        ttlIncome:  (ttlIncome  != null) ? ttlIncome.toFixed(2)  : '0.00',
        ttlExpense: (ttlExpense != null) ? ttlExpense.toFixed(2) : '0.00',
    };
};

const getYearlySummary = async (userId) => {
    const year = new Date().getFullYear();
    const whereClause = {
        UserId: userId,
        date: {
            [Op.gte]: new Date(`${year}-01-01`),
            [Op.lt]:  new Date(`${year}-12-31`),
        },
    };

    const groupBy = [fn('YEAR', col('date')), fn('MONTH', col('date'))];
    const order   = [[fn('YEAR', col('date')), 'DESC'], [fn('MONTH', col('date')), 'DESC']];
    const attrs   = [
        [fn('YEAR',  col('date')), 'year'],
        [fn('MONTH', col('date')), 'month'],
        [fn('SUM',   col('amount')), 'totalAmount'],
    ];

    const monthlyE = await Transactions.findAll({ attributes: attrs, where: { ...whereClause, type: 0 }, group: groupBy, order });
    const monthlyI = await Transactions.findAll({ attributes: attrs, where: { ...whereClause, type: 1 }, group: groupBy, order });

    const ttlIncome  = await Transactions.sum('amount', { where: { ...whereClause, type: 1 } });
    const ttlExpense = await Transactions.sum('amount', { where: { ...whereClause, type: 0 } });
    const surplus    = (ttlIncome || 0) - (ttlExpense || 0);

    return {
        monthlyE:   monthlyE   || [],
        monthlyI:   monthlyI   || [],
        ttlIncome:  (ttlIncome  != null) ? ttlIncome.toFixed(2)  : '0.00',
        ttlExpense: (ttlExpense != null) ? ttlExpense.toFixed(2) : '0.00',
        surplus:    surplus.toFixed(2),
    };
};

const getById = async (id) => {
    return await Transactions.findAll({
        where: { id },
        include: [{ model: Categories, include: [{ model: Icons }] }],
    });
};

const countByCategory = async (userId, categoryId) => {
    return await Transactions.findAndCountAll({
        where: { UserId: userId, CategoryId: categoryId },
        include: [{ model: Categories, include: [{ model: Icons }] }],
    });
};

const remove = async (id) => {
    const transaction = await Transactions.findByPk(id);
    if (!transaction) return false;
    await transaction.destroy();
    return true;
};

const removeByCategory = async (categoryId) => {
    await Transactions.destroy({ where: { CategoryId: categoryId } });
};

const update = async (id, { date, amount, remark, CategoryId }) => {
    const transaction = await Transactions.findByPk(id);
    if (!transaction) return null;

    if (date       !== undefined) transaction.date       = date;
    if (amount     !== undefined) transaction.amount     = amount;
    if (remark     !== undefined) transaction.remark     = remark;
    if (CategoryId !== undefined) {
        const cate = await Categories.findByPk(CategoryId);
        if (!cate) return { categoryNotFound: true };
        transaction.CategoryId = CategoryId;
        transaction.type       = cate.is_income;
    }

    await transaction.save();
    return transaction;
};

module.exports = { create, getMonthly, getYearlySummary, getById, countByCategory, remove, removeByCategory, update };
