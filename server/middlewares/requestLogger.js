const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    res.on('finish', () => {
        const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
        logger[level](`${req.method} ${req.url} ${res.statusCode}`);
    });
    next();
};

module.exports = requestLogger;
