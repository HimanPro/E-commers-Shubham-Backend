const mongoose = require('mongoose');

const cashbackSchema = new mongoose.Schema({
  user: { type: String, required: true },
  pkgId: { type: String,required: true },
  amount: { type: Number, required: true },
  day: { type: Number, required: true },
  remainingDay: { type: Number, required: true },
  status: { type: String, default: 'credited' },
  creditedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Cashback', cashbackSchema);