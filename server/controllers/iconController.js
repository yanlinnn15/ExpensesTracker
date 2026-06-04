const iconService = require('../services/iconService');
const AppError = require('../middlewares/AppError');

const create = async (req, res, next) => {
    try {
        await iconService.create(req.body);
        res.status(201).json('Created Successful!');
    } catch (e) { next(e); }
};

const getAll = async (req, res, next) => {
    try {
        const icons = await iconService.getAll();
        if (!icons) throw new AppError(404, 'Icons Not Found');
        res.status(200).json(icons);
    } catch (e) { next(e); }
};

module.exports = { create, getAll };
