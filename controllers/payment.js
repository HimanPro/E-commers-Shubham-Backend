const Razorpay = require('razorpay');
const crypto = require('crypto');
const express = require("express");
const config = require('../config/config');
const router = express.Router()
const razorpay = new Razorpay({
    key_id: config.razorpayKeyId,
    key_secret: config.razorpayKeySecret
  });
  
  router.post('/create-order', async (req, res) => {
    const { amount } = req.body;
  
    const options = {
      amount: amount * 100, 
      currency: 'INR',
      receipt: 'receipt_order_' + Math.random().toString(36).slice(2),
    };
  
    try {
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  });

  router.post('/verify-order', (req, res) => {
    console.log(req.body)
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    console.log(sign, "sign")
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpayKeySecret)
      .update(sign.toString())
      .digest("hex");
  console.log(expectedSignature, "expectedSignature")
  console.log(razorpay_signature, "razorpay_signature")
    if (expectedSignature === razorpay_signature) {
      res.send({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).send({ success: false, message: "Invalid signature, payment verification failed" });
    }
  });

  module.exports = router