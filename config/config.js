module.exports = {
    jwtSecret: process.env.JWT_SECRET ,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    referralBonus: 100, 
    minWithdrawalAmount: 110, 
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
    paypalClientSecret:process.env.PAYPAL_CLIENT_SECRET
  };