const Order = require('../models/Order');
const { createRazorpayOrder, verifyPayment } = require('../services/paymentService');
const { creditReferralBonuses } = require('../services/referralService');

exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount} = req.body;
    
    // const order = await Order.findById(orderId);
    // if (!order || order.user.toString() !== req.user._id.toString()) {
    //   return res.status(404).json({ success: false, message: 'Order not found' });
    // }
    
    // if (order.paymentStatus !== 'pending') {
    //   return res.status(400).json({ success: false, message: 'Payment already processed' });
    // }
    
    const razorpayOrder = await createRazorpayOrder(amount);
    
    res.status(200).json({ success: true, razorpayOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
    
    // const order = await Order.findByIdAndUpdate(orderId, {
    //   paymentStatus: 'completed',
    //   paymentId: razorpay_payment_id
    // }, { new: true });
    
    // await creditReferralBonuses(orderId);
    
    res.status(200).json({ success: true, message: "Payment Successfull"});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
