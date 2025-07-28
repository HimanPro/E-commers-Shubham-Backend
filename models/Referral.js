const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: { type: String, required: true }, 
  name: { type: String, required: true },
  referee: { type: String, required: true },  
  bonusAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'credited'], default: 'pending' },
  creditedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Referral', referralSchema);
