const User = require('../models/User');
const Referral = require('../models/Referral');
const config = require('../config/config');

async function processReferral(userId, referralCode) {
  if (!referralCode) return null;
  
  const referrer = await User.findOne({ referralCode });
  if (!referrer) return null;
  
  const referral = new Referral({
    referrer: referrer._id,
    referee: userId,
    bonusAmount: config.referralBonus,
    status: 'pending'
  });
  
  await referral.save();
  return referral;
}

async function creditReferralBonuses(orderId) {
  const order = await Order.findById(orderId).populate('user');
  if (!order || order.paymentStatus !== 'completed') return;
  
  const orderCount = await Order.countDocuments({ user: order.user._id });
  if (orderCount > 1) return;
  
  const referral = await Referral.findOne({ 
    referee: order.user._id,
    status: 'pending'
  });
  
  if (referral) {
    await User.findByIdAndUpdate(referral.referrer, {
      $inc: { walletBalance: config.referralBonus, totalEarned: config.referralBonus }
    });
    
    await User.findByIdAndUpdate(referral.referee, {
      $inc: { walletBalance: config.referralBonus, totalEarned: config.referralBonus }
    });
    
    referral.status = 'credited';
    referral.creditedAt = new Date();
    await referral.save();
  }
}

module.exports = { processReferral, creditReferralBonuses };