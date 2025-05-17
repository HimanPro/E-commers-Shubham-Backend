const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: String, required: true }, 
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: Boolean, default: true },
  razorpay_payment_id: { type: String, required: true },
  pkgId: { type: String, required: true },
  onlyBuy: { type: Boolean, required: true },
  rewardStatus: {
    type: Boolean,
    default: false
  },
  rewardDaysCompleted: {
    type: Number,
    default: 0
  },
  lastRewardDate: {
    type: Date,
    default: null
  },
  

  name: { type: String, required: true },
  phone: { type: String, required: true },
  products: { type: Array, default: [] },
  address: {
    line1: { type: String},
    line2: { type: String },
    city: { type: String},
    state: { type: String },
    postalCode: { type: String},
    country: { type: String}
  },

  // Delivery & Order Status
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  deliveryDate: { type: Date },

  // Additional metadata
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
