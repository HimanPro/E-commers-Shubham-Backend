const mongoose = require('mongoose');

const cashbackSchema = new mongoose.Schema({
  user: { type: String, required: true },
  pkgId: { type: String,required: true },
  amount: { type: Number, required: true },
  onlyBuy: { type: Boolean, default: false },
  day: { type: Number},
  month: { type: Number},
  remainingDay: { type: Number},
  remainingMonth: { type: Number},
  status: { type: String, default: 'credited' },
  creditedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Cashback', cashbackSchema);