const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { creditReferralBonuses } = require('../services/referralService');

exports.createOrder = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      amount,
      pkgId,
      customerName,
      phone,
      email,
      address
    } = req.body;

    const userId = req.user.id;

    // Basic validation
    if (!razorpay_payment_id || !amount || !pkgId || !customerName || !phone || !email || !address) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const {
      line1,
      line2,
      city,
      state,
      postalCode,
      country
    } = address;

    if (!line1 || !city || !state || !postalCode || !country) {
      return res.status(400).json({ success: false, message: 'Incomplete address' });
    }

    // Create order
    const order = await Order.create({
      user: userId,
      totalAmount: amount,
      paymentId: razorpay_payment_id,
      packageId: pkgId,
      customerName,
      phone,
      email,
      address: {
        line1,
        line2,
        city,
        state,
        postalCode,
        country
      }
    });

    // Mark package as purchased in user document
    const pkgField = {};
    pkgField[`packages.${pkgId}`] = true;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: pkgField },
      { new: true }
    );

    res.status(200).json({ success: true, order, user });

  } catch (error) {
    console.error("Create Order Error:", error);
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