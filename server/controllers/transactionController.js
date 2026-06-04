const Joi = require('joi');
const transactionService = require('../services/transactionService');
const AppError = require('../middlewares/AppError');

const ESchema = Joi.object({
    date:       Joi.date().iso(),
    amount:     Joi.number().precision(2).min(0.01).max(99999999999999999999.99),
    remark:     Joi.string().min(0).max(255),
    CategoryId: Joi.number().integer().min(1),
    type:       Joi.boolean(),
}).min(1);

const validate = (schema, data) => {
    const { error } = schema.validate(data);
    if (error) throw new AppError(400, error.details[0].message);
};

const create = async (req, res, next) => {
    try {
        validate(ESchema, req.body);
        const trans = await transactionService.create(req.user.id, req.body);
        res.status(201).json({ message: 'Transactions Created Successfully!', trans });
    } catch (e) { next(e); }
};

const getMonthly = async (req, res, next) => {
    try {
        const data = await transactionService.getMonthly(req.user.id, req.query.mth);
        res.status(200).json(data);
    } catch (e) { next(e); }
};

const getYearlySummary = async (req, res, next) => {
    try {
        const data = await transactionService.getYearlySummary(req.user.id);
        res.status(200).json(data);
    } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
    try {
        const transaction = await transactionService.getById(req.params.id);
        if (!transaction) throw new AppError(404, 'Transaction Not Found');
        res.status(200).json(transaction);
    } catch (e) { next(e); }
};

const countByCategory = async (req, res, next) => {
    try {
        const { count, rows } = await transactionService.countByCategory(req.user.id, req.params.id);
        res.status(200).json({ countT: count, cate: rows });
    } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
    try {
        const deleted = await transactionService.remove(req.params.id);
        if (!deleted) throw new AppError(404, 'Transaction Not Found');
        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (e) { next(e); }
};

const removeByCategory = async (req, res, next) => {
    try {
        await transactionService.removeByCategory(req.params.id);
        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (e) { next(e); }
};

const update = async (req, res, next) => {
    try {
        const { date, amount, remark, CategoryId } = req.body;
        validate(ESchema, { date, amount, remark, CategoryId });
        const result = await transactionService.update(req.params.id, { date, amount, remark, CategoryId });
        if (!result)                 throw new AppError(404, 'Transaction Not Found');
        if (result.categoryNotFound) throw new AppError(404, 'Category Not Found');
        res.status(200).json({ message: 'Transaction updated successfully', transaction: result });
    } catch (e) { next(e); }
};

module.exports = { create, getMonthly, getYearlySummary, getById, countByCategory, remove, removeByCategory, update };
