const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const bankDetailsSchema = new mongoose.Schema({
  accountHolderName: { type: String},
  accountNumber: { type: String,  },
  ifscCode: { type: String, }
});

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true , immutable: true}, 
  name: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  referralCode: { type: String,  immutable: true},
  walletBalance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  referralBonus: { type: Number, default: 0 },
  bankDetails: { type: bankDetailsSchema,},
  pendingWithdrawal: { type: Number, default: 0 },
  address: {
    type: String,
   
  },

  createdAt: { type: Date, default: Date.now }
});

// // Hash password
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// Generate referral code and userId
// userSchema.pre('save', async function(next) {
//   if (!this.referralCode) {
//     this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
//   }

//   if (!this.userId) {
//     const User = mongoose.model('User'); // prevent circular dependency
//     const lastUser = await User.findOne({}, {}, { sort: { createdAt: -1 } });

//     let lastNumber = 0;
//     if (lastUser && lastUser.userId) {
//       lastNumber = parseInt(lastUser.userId.replace('USER', '')) || 0;
//     }
//     this.userId = `USER${(lastNumber + 1).toString().padStart(4, '0')}`; // example: USER0001
//   }

//   next();
// });

// Compare password method
// userSchema.methods.matchPassword = async function(enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };
userSchema.index({ phone: 1});

module.exports = mongoose.model('User', userSchema);
