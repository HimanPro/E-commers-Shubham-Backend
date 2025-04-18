const Order = require('../models/Order');
const Cashback = require('../models/Cashback');
const User = require('../models/User');

async function distributeDailyCashback() {
  const orders = await Order.find({
    paymentStatus: 'completed',
    createdAt: { 
      $gte: new Date(new Date().setDate(new Date().getDate() - 30))
    }
  }).populate('products.product');

  for (const order of orders) {
    for (const item of order.products) {
      const daysPassed = Math.floor((new Date() - order.createdAt) / (1000 * 60 * 60 * 24));
      
      if (daysPassed <= item.cashbackDuration) {
        const existingCashback = await Cashback.findOne({
          order: order._id,
          product: item.product._id,
          day: daysPassed
        });

        if (!existingCashback) {
          const dailyCashbackAmount = (item.priceAtPurchase * item.quantity) * 
            (item.cashbackPercentage / 100) / item.cashbackDuration;
          
          const cashback = new Cashback({
            user: order.user,
            order: order._id,
            product: item.product._id,
            amount: dailyCashbackAmount,
            day: daysPassed
          });
          
          await cashback.save();
          
          await User.findByIdAndUpdate(order.user, {
            $inc: { walletBalance: dailyCashbackAmount, totalEarned: dailyCashbackAmount }
          });
        }
      }
    }
  }
}

module.exports = { distributeDailyCashback };