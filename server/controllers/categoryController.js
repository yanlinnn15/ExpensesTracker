const Joi = require('joi');
const categoryService = require('../services/categoryService');
const AppError = require('../middlewares/AppError');

const CategoriesSchema = Joi.object({
    name:      Joi.string().min(1).max(255),
    IconId:    Joi.number().integer().min(1),
    is_income: Joi.boolean(),
}).min(1);

const validate = (schema, data) => {
    const { error } = schema.validate(data);
    if (error) throw new AppError(400, error.details[0].message);
};

const create = async (req, res, next) => {
    try {
        validate(CategoriesSchema, req.body);
        await categoryService.create(req.user.id, req.body);
        res.status(201).json({ message: 'Category Created Successfully!' });
    } catch (e) { next(e); }
};

const update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) throw new AppError(400, 'Invalid category ID');
        const { name, IconId, is_income } = req.body;
        validate(CategoriesSchema, { name, IconId, is_income });
        const category = await categoryService.update(id, req.user.id, { name, IconId, is_income });
        if (!category) throw new AppError(404, 'Category Not Found');
        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (e) { next(e); }
};

const getAll = async (req, res, next) => {
    try {
        const data = await categoryService.getAll(req.user.id);
        if (!data.cate) throw new AppError(404, 'Category Not Found');
        res.status(200).json(data);
    } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) throw new AppError(400, 'Invalid category ID');
        const cate = await categoryService.getById(id);
        if (!cate) throw new AppError(404, 'Category Not Found');
        res.status(200).json(cate);
    } catch (e) { next(e); }
};

const getOthersByType = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) throw new AppError(400, 'Invalid category ID');
        const categories = await categoryService.getOthersByType(id, req.user.id);
        if (!categories) throw new AppError(404, 'Category Not Found');
        res.status(200).json(categories);
    } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) throw new AppError(400, 'Invalid category ID');
        const deleted = await categoryService.remove(id, req.user.id);
        if (!deleted) throw new AppError(404, 'Category not found');
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (e) { next(e); }
};

module.exports = { create, update, getAll, getById, getOthersByType, remove };
