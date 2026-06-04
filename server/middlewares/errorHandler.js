const errorHandler = (err, req, res, next) => {
    const status  = err.status || err.statusCode || 500;
    const message = err.message || 'Server Error';

    if (process.env.NODE_ENV === 'production') {
        console.error(`[${new Date().toISOString()}] ${req.method} ${req.url} → ${status}: ${message}`);
    } else {
        console.error(err.stack || err);
    }

    res.status(status).json({
        message: status >= 500 ? 'Server Error' : message,
        ...(process.env.NODE_ENV !== 'production' && status >= 500 && { stack: err.stack }),
    });
};

module.exports = errorHandler;
