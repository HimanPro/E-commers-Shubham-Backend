const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: String, required: true }, 
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: Boolean, default: true },
  razorpay_payment_id: { type: String, required: true },
  pkgId: { type: String, required: true },

  name: { type: String, required: true },
  phone: { type: String, required: true }, 
  onlyBuy: { type: Boolean, required: true }, 

  address: {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
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
