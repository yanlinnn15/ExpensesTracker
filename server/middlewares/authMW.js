const { verify } = require('jsonwebtoken');
const { Users } = require('../models');
const AppError = require('./AppError');

const validateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError(401, 'User not logged in'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verify(token, process.env.JWT_SECRET);
        const user    = await Users.findOne({ where: { id: decoded.id } });

        if (!user) return next(new AppError(403, 'Account is inactive'));

        req.user = { ...decoded, isGuest: decoded.isGuest || false };
        next();
    } catch (error) {
        next(new AppError(401, 'Invalid access token'));
    }
};

module.exports = { validateToken };
