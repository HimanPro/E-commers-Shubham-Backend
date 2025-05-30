const Razorpay = require("razorpay");
const crypto = require("crypto");
const config = require("../config/config");

const instance = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
});

exports.createRazorpayOrder = async (amount) => {
  const options = {
    amount: Math.round(parseFloat(amount) * 100),
    currency: "INR",
    receipt: "receipt_order_" + Math.random().toString(36).slice(2),
  };

  return instance.orders.create(options);
};

exports.verifyPayment = (
  razorpay_payment_id,
  razorpay_order_id,
  razorpay_signature
) => {
   const sign = razorpay_payment_id + "|" + razorpay_order_id;
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpayKeySecret)
      .update(sign.toString())
      .digest("hex");


  return expectedSignature === razorpay_signature;
};


