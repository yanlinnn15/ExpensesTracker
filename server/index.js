require('dotenv').config({ path: '.env.development' });
const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { cleanupGuestData } = require('./services/cleanup');
// Load passport configuration after environment variables are loaded
require('./config/passport'); // Import passport config

// Get port from environment variable with fallback
const PORT = process.env.PORT || 3001;

console.log('Starting server with configuration:');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('Google OAuth Configured:', Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET));

// Middleware setup
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'accessToken'],
  exposedHeaders: ['Authorization', 'accessToken']
}));

// CORS debug middleware
app.use((req, res, next) => {
  console.log('CORS Headers:', {
    origin: res.getHeader('Access-Control-Allow-Origin'),
    methods: res.getHeader('Access-Control-Allow-Methods'),
    credentials: res.getHeader('Access-Control-Allow-Credentials')
  });
  next();
});

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

// Root route for API health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PET Finance API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Import and use route handlers
const usersRouter = require('./routes/Users');
const cateRouter = require('./routes/Categories');
const transRouter = require('./routes/Transactions');
const budgetRouter = require('./routes/Budgets');
const iconRouter = require('./routes/Icons');

// API routes
app.use('/auth', usersRouter);
app.use('/cate', cateRouter);
app.use('/trans', transRouter);
app.use('/budget', budgetRouter);
app.use('/icon', iconRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Database setup
const db = require('./models');

console.log('Attempting to connect to database...');
console.log('Database config:', {
  dialect: db.sequelize.config.dialect,
  storage: db.sequelize.config.storage
});

// Force sync the database in development
if (process.env.NODE_ENV !== 'production') {
  db.sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced successfully');
  }).catch(err => {
    console.error('Error syncing database:', err);
  });
}

db.sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    return db.sequelize.sync();
  })
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Frontend URL:", process.env.FRONTEND_URL || 'http://localhost:5173');
      
      // Start cleanup interval
      setInterval(cleanupGuestData, 60 * 60 * 1000); // Run every hour
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy. Please make sure no other instance is running.`);
      }
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  });
