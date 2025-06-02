// controllers/paymentController.js
const { createPaypalOrder, capturePaypalPayment } = require('../services/paypalService');

exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const paypalOrder = await createPaypalOrder(amount);
    res.status(200).json({ success: true, paypalOrder });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const paymentResult = await capturePaypalPayment(orderId);
    if (paymentResult.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    res.status(200).json({ success: true, message: 'Payment successful', paymentResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
