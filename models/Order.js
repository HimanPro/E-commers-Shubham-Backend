const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: Boolean, default: true },
  paymentId: {type:String, require: true},
  packageId: {type: String, require: true},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);