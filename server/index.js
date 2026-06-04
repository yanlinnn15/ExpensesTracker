const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors({origin: 'http://localhost:5173'}));

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

const { Op } = require('sequelize');

db.sequelize.sync({ alter: true }).then(async () => {
    // Delete abandoned guest accounts older than 24 hours
    const { Users } = db;
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const deleted = await Users.destroy({
        where: { isGuest: true, createdAt: { [Op.lt]: cutoff } }
    });
    if (deleted > 0) console.log(`Cleaned up ${deleted} expired guest account(s)`);

    app.listen(3001, () => {
        console.log("server running on port 3001");
    });
});
