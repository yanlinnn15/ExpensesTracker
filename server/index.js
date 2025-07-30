const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { cleanupGuestData } = require('./services/cleanup');
require('./config/passport'); // Import passport config

app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'https://your-netlify-app.netlify.app'  // Replace with your Netlify URL
  ],
  credentials: true
}));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

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

    // Run cleanup every hour
    setInterval(cleanupGuestData, 60 * 60 * 1000);
});
