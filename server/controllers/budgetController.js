const Joi = require('joi');
const budgetService = require('../services/budgetService');
const AppError = require('../middlewares/AppError');
const { logEvent, EVENTS } = require('../utils/eventLogger');

const BSchema = Joi.object({
    amount:     Joi.number().precision(2).min(0.01).max(99999999999999999999.99),
    remark:     Joi.string().min(0).max(255),
    CategoryId: Joi.number().integer().min(1),
}).min(1);

const validate = (schema, data) => {
    const { error } = schema.validate(data);
    if (error) throw new AppError(400, error.details[0].message);
};

const create = async (req, res, next) => {
    try {
        validate(BSchema, req.body);
        const result = await budgetService.create(req.user.id, req.body);
        if (result.conflict) throw new AppError(400, 'Budget already created for this Category!');
        logEvent(EVENTS.BUDGET_CREATED, req.user.id, { categoryId: req.body.CategoryId, amount: req.body.amount });
        res.status(201).json({ message: 'Budgets Created Successfully!' });
    } catch (e) { next(e); }
};

const getAll = async (req, res, next) => {
    try {
        const data = await budgetService.getAll(req.user.id);
        res.status(200).json(data);
    } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) throw new AppError(400, 'Invalid budget ID');
        const deleted = await budgetService.remove(id, req.user.id);
        if (!deleted) throw new AppError(404, 'Budget Not Found');
        logEvent(EVENTS.BUDGET_DELETED, req.user.id, { budgetId: id });
        res.status(200).json({ message: 'Success' });
    } catch (e) { next(e); }
};

const update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) throw new AppError(400, 'Invalid budget ID');
        const { amount, remark } = req.body;
        validate(BSchema, { amount, remark });
        const budget = await budgetService.update(id, req.user.id, { amount, remark });
        if (!budget) throw new AppError(404, 'Budget Not Found');
        logEvent(EVENTS.BUDGET_UPDATED, req.user.id, { budgetId: id, amount });
        res.status(200).json({ message: 'Budget updated successfully', budget });
    } catch (e) { next(e); }
};

module.exports = { create, getAll, remove, update };
