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

db.sequelize.sync().then(() => {
    app.listen(3001, () => {
        console.log("server running on port 3001");
    });
});
