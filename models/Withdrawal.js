const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  bankDetails: {
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    accountHolderName: { type: String, required: true }
  },
  status: { type: String, enum: ['pending', 'success', 'rejected'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date, default: Date.now },
  referenceNumber: {
    type: String,
    required: false // or true if you always want it
  }
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
