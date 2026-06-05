const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    const status  = err.status || err.statusCode || 500;
    const message = err.message || 'Server Error';

    if (status >= 500) {
        logger.error(`${req.method} ${req.url} → ${status}: ${message}`, { stack: err.stack });
    } else {
        logger.warn(`${req.method} ${req.url} → ${status}: ${message}`);
    }

    res.status(status).json({
        message: status >= 500 ? 'Server Error' : message,
        ...(process.env.NODE_ENV !== 'production' && status >= 500 && { stack: err.stack }),
    });
};

module.exports = errorHandler;
