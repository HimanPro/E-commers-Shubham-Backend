const mongoose = require('mongoose');

const cashbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pkgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  day: { type: Number, required: true },
  status: { type: String, default: 'credited' },
  creditedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Cashback', cashbackSchema);