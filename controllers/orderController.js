const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { creditReferralBonuses } = require('../services/referralService');

exports.createOrder = async (req, res) => {
  try {
    const { razorpay_payment_id, amount, pkgId } = req.body;
    const userId = req.user.id;

    const order = await Order.create({
      user: userId,
      totalAmount: amount,
      paymentId: razorpay_payment_id,
      packageId: pkgId
    });

    const pkgField = {};
    pkgField[pkgId] = true; 

    const user = await User.findOneAndUpdate(
      { userId },
      { $set: pkgField },
      { new: true }
    );

    res.status(200).json({ success: true, order, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('products.product')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};