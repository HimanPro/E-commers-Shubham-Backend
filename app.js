const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const cron = require('node-cron');

// Route files
const auth = require('./routes/auth');
const user = require('./routes/user');
const order = require('./routes/order');
const payment = require('./routes/payment');
const admin = require('./routes/admin');
const Order = require('./models/Order');
const User = require('./models/User');
const Cashback = require('./models/Cashback');
// const payment = require('./controllers/payment');

const app = express();



// Connect to database
connectDB();

// Start cashback scheduler

// Middleware
// app.use(cors());
app.use(cors({
  origin: ['http://localhost:5173', 'https://aldgroup.shop','https://www.aldgroup.shop','https://admin.aldgroup.shop','http://192.168.1.140:5173'],
  credentials: true 
}));
app.use(express.json());
app.use(morgan('dev')); 

// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', user);
app.use('/api/orders', order);
app.use('/api/payments', payment);
app.use('/api/admin', admin);

const pkgRewards = {
  pkg500: { reward: 15, days: 50 },
  pkg1000: { reward: 30, days: 50 },
  pkg2000: { reward: 60, days: 50 },
  pkg5000: { reward: 150, days: 50 },
  pkg8000: { reward: 240, days: 50 },
  pkg12000: { reward: 360, days: 50 },
  pkg30000: { reward: 750, days: 60 },
  pkg50000: { reward: 1250, days: 60 },
  pkg75000: { reward: 1600, days: 60 },
  pkg100000: { reward: 2000, days: 80 },
  pkg200000: { reward: 4000, days: 80 },
  pkg300000: { reward: 6000, days: 80 },
  pkg400000: { reward: 8000, days: 80 }
};

const getIncome = async (userId) => {
  const orderData = await Order.find({ user: userId }).sort({ createdAt: -1 });
  if (!orderData) return;

  const userData = await User.findOne({ userId });
  if (!userData) return;

  for (let i = 0; i < orderData.length; i++) {
    const order = orderData[i];

    if (order.onlyBuy === true) continue;
    if (order.rewardStatus === true) continue; // Skip if reward already completed

    const pkg = pkgRewards[order.pkgId];
    if (!pkg) continue;

    // Check if today's reward is already given
    const today = new Date().toDateString();
    const lastRewardDate = order.lastRewardDate ? new Date(order.lastRewardDate).toDateString() : null;

    if (today === lastRewardDate) continue; // Already rewarded today  
    
    if (order.rewardDaysCompleted >= pkg.days) {
      order.rewardStatus = true; // Reward period over
      await order.save();
      continue;
    }

    // Credit reward
    userData.walletBalance = (userData.walletBalance || 0) + pkg.reward;
    await userData.save();

    // Update order
    order.rewardDaysCompleted += 1;
    order.lastRewardDate = new Date();
    if (order.rewardDaysCompleted >= pkg.days) {
      order.rewardStatus = true;
    }
    await Cashback.create({
      user: order.user,
      pkgId:order.pkgId,
      amount: pkg.reward,
      day: order.rewardDaysCompleted,
      remainingDay: pkg.days - order.rewardDaysCompleted,
    })
    await order.save();
  }
};

// cron.schedule('*/20 * * * * *', async () => {

cron.schedule('0 2 * * *', async () => {
  try {
    const data = await User.find();
    for(let i=0; i < data.length; i++){
      await getIncome(data[i].userId)
    }
  } catch (err) {
    console.error("Error running getIncome:", err.message);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

module.exports = app;