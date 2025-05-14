const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const startCashbackScheduler = require('./utils/scheduleCashback');
const cron = require('node-cron');

// Route files
const auth = require('./routes/auth');
const user = require('./routes/user');
const order = require('./routes/order');
const payment = require('./routes/payment');
const Order = require('./models/Order');
const User = require('./models/User');
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

const getIncome = async (userId) => {
  const orderData = await Order.find({ user: userId }).sort({ createdAt: -1 });
  if(!orderData){
    return;
  }

  for (let i = 0; i < orderData.length; i++) {
    if (orderData[i].onlyBuy === true) {
      continue;
    }

    let rewardAmt = 0;

    switch (orderData[i].pkgId) {
      case "pkg500":
        rewardAmt = 15;
        break;
      case "pkg1000":
        rewardAmt = 30;
        break;
      case "pkg2000":
        rewardAmt = 60;
        break;
      case "pkg5000":
        rewardAmt = 150;
        break;
      case "pkg8000":
        rewardAmt = 240;
        break;
      case "pkg12000":
        rewardAmt = 360;
        break;
      case "pkg30000":
        rewardAmt = 750;
        break;
      case "pkg50000":
        rewardAmt = 1250;
        break;
      case "pkg75000":
        rewardAmt = 1600;
        break;
      case "pkg100000":
        rewardAmt = 2000;
        break;
      case "pkg200000":
        rewardAmt = 4000;
        break;
      case "pkg300000":
        rewardAmt = 6000;
        break;
      case "pkg400000":
        rewardAmt = 8000;
        break;
      default:
        rewardAmt = 0;
    }

    if (rewardAmt > 0) {
      const userData = await User.findOne({ userId });
      if (userData) {
        userData.walletBalance = (userData.walletBalance || 0) + rewardAmt;
        await userData.save();
      }
    }
  }
};


cron.schedule('0 2 * * *', async () => {
  console.log("Running getIncome for tzc4101 at 2:00 AM...");
  try {
    const data = await User.find();
    for(let i=0; i < data.length; i++){
      // console.log(data[i])
      await getIncome(data[i].userId)
    }
    console.log("getIncome completed successfully.");
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