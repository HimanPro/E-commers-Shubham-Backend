const Cashback = require("../models/Cashback");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

exports.createOrder = async (req, res) => {
  console.log(req.body, "Body Data");
  try {
    const { razorpay_payment_id, formData } = req.body;
    const { amount, pkgId, name, phone, address, onlyBuy, products } = formData;
    const userId = req.user.id;
    if (
      !razorpay_payment_id ||
      !amount ||
      !pkgId ||
      !name ||
      !phone
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
      razorpay_payment_id,
      pkgId,
      onlyBuy,
      name,
      phone,
      products,
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
