require('dotenv').config();

const logger = require('./utils/logger');
const requestLogger = require('./middlewares/requestLogger');

['JWT_SECRET', 'CLIENT_URL', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD'].forEach(k => {
    if (!process.env[k]) {
        logger.error(`Missing required env var: ${k}`);
        process.exit(1);
    }
});

const express = require('express');
const app = express();
const cors = require('cors');
const { Op } = require('sequelize');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(requestLogger);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many attempts, please try again later.' },
});
app.use('/auth/login',    authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth/guest',    authLimiter);

const db = require('./models');
const seedIcons = require('./seeders/seedIcons');

const usersRouter = require('./routes/Users');
app.use('/auth', usersRouter);
const cateRouter = require('./routes/Categories');
app.use('/cate', cateRouter);
const transRouter = require('./routes/Transactions');
app.use('/trans', transRouter);
const budgetRouter = require('./routes/Budgets');
app.use('/budget', budgetRouter);
const iconRouter = require('./routes/Icons');
app.use('/icon', iconRouter);

app.use((req, res, next) => {
    next({ status: 404, message: `Route not found: ${req.method} ${req.url}` });
});

const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: true };
db.sequelize.sync(syncOptions).then(async () => {
    const { Users, Icons } = db;

    await seedIcons(Icons, logger);
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const deleted = await Users.destroy({
        where: { isGuest: true, createdAt: { [Op.lt]: cutoff } }
    });
    if (deleted > 0) logger.info(`Cleaned up ${deleted} expired guest account(s)`);

    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
}).catch(err => {
    logger.error('DB connection failed', { error: err.message, stack: err.stack });
    process.exit(1);
});
