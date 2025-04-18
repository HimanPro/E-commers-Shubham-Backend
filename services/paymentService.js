const Razorpay = require('razorpay');
const config = require('../config/config');

// const instance = new Razorpay({
//   key_id: config.razorpayKeyId,
//   key_secret: config.razorpayKeySecret
// });

// exports.createRazorpayOrder = async (amount, currency = 'INR') => {
//   const options = {
//     amount: amount * 100,
//     currency,
//     receipt: `receipt_${Date.now()}`
//   };
  
//   return instance.orders.create(options);
// };

// exports.verifyPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
//   const crypto = require('crypto');
//   const expectedSignature = crypto.createHmac('sha256', config.razorpayKeySecret)
//     .update(razorpayOrderId + "|" + razorpayPaymentId)
//     .digest('hex');
  
//   return expectedSignature === razorpaySignature;
// };

// Mock payment service for testing
exports.createPaymentOrder = async (amount, currency = 'INR') => {
    return {
      id: `mock_pay_${Date.now()}`,
      amount: amount * 100,
      currency,
      status: 'created',
      receipt: `mock_receipt_${Date.now()}`
    };
  };
  
  exports.verifyPayment = () => {
    // Always return true for testing
    return { success: true, paymentId: `mock_payment_${Date.now()}` };
  };
  
  exports.initiateUPIPayment = async (amount, upiId) => {
    // Mock UPI payment response
    return {
      success: true,
      transactionId: `mock_upi_${Date.now()}`,
      amount,
      upiId,
      status: 'completed'
    };
  };