require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const { Op } = require('sequelize');

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));

const db = require('./models');

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

db.sequelize.sync({ alter: true }).then(async () => {
    // Delete abandoned guest accounts older than 24 hours
    const { Users } = db;
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const deleted = await Users.destroy({
        where: { isGuest: true, createdAt: { [Op.lt]: cutoff } }
    });
    if (deleted > 0) console.log(`Cleaned up ${deleted} expired guest account(s)`);

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
});
