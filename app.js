const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const startCashbackScheduler = require('./utils/scheduleCashback');

// Route files
const auth = require('./routes/auth');
const user = require('./routes/user');
const order = require('./routes/order');
const payment = require('./routes/payment');
// const payment = require('./controllers/payment');

const app = express();



// Connect to database
connectDB();

// Start cashback scheduler
startCashbackScheduler();

// Middleware
// app.use(cors());
app.use(cors({
  origin: ['http://localhost:5173', 'https://aldgroup.shop','https://www.aldgroup.shop'],
  credentials: true 
}));
app.use(express.json());
app.use(morgan('dev')); 

// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', user);
app.use('/api/orders', order);
app.use('/api/payments', payment);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

module.exports = app;