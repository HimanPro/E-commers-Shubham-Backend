const Cashback = require("../models/Cashback");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

exports.createOrder = async (req, res) => {
  console.log(req.body, "Body Data");
  try {
    // const { razorpay_payment_id, formData } = req.body;
    const {  formData } = req.body;

    console.log(req.user, "User Data");


    const { amount, pkgId, name, phone, address, onlyBuy, products, reference, image } = req.body;
    const userId = req.user.id;
    if (
      !amount ||
      !pkgId ||
      !name ||
      !phone ||
      !reference ||
      !image
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if(address){
      var { line1, line2, city, state, postalCode, country } = address;
    }

    // if (!line1 || !city || !state || !postalCode || !country) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Incomplete address" });
    // }

    const order = await Order.create({
      user: userId,
      totalAmount: amount,
      pkgId,
      onlyBuy,
      name,
      reference,
      paymentScreenShot: image,
      phone,
      products,
      reference,
      qr: image,
      address: {
        line1,
        line2,
        city,
        state,
        postalCode,
        country,
      },
    });

    const updateField = {};
    updateField[`${pkgId}`] = true;

    const user = await User.findOneAndUpdate(
      { userId },
      { $set: updateField },
      { new: true }
    );

    res.status(200).json({ success: true, order, user });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { paymentStatus: true } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCashback = async (req, res) => {
  const {userId} = req.query;
  if(!userId) {
    return res.status(400).json({ success: false, message: "Missing userId" });
  }
  try {
    const cashback = await Cashback.find({user: userId}).sort({creditedAt: -1});
    if(!cashback) {
      return res.status(404).json({ success: false, message: "No cashback found" });
    }
    res.status(200).json({ success: true, cashback });
  } catch (error) {
    console.error("Get Cashback Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
