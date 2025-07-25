const express = require("express");
const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");
const Referral = require("../models/Referral");
const Order = require("../models/Order");
const Cashback = require("../models/Cashback");
const AdminCred = require("../models/AdminCred");
const router = express.Router();

router.get("/allUsersAldGroup", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    res.json({ data: users, totalUsers: users.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/singleUserAldGroup", async (req, res) => {
  const { user } = req.query;
  try {
    let data = await User.findOne({ userId: user });

    if (!data) {
      data = await User.findOne({ phone: user });
      if (!data) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
    }
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/totalWithdrawnAldGroup", async (req, res) => {
  try {
    const data = await Withdrawal.find().sort({ createdAt: 1 });
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "No withdrawals found" });
    }
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      total += data[i].amount;
    }
    res.json({ data, totalWithdrawn: total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/withdrawals/approve
router.post("/approveWithdrawals", async (req, res) => {
  const { id, referenceNumber } = req.body;

  // Validate inputs
  if (!id || typeof id !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Withdrawal ID is required" });
  }

  if (!referenceNumber || typeof referenceNumber !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Reference number is required" });
  }

  // Example: Validate reference format (alphanumeric, 8–20 characters)
  const refRegex = /^[A-Za-z0-9]{8,20}$/;
  if (!refRegex.test(referenceNumber)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid reference number format" });
  }

  try {
    const withdrawal = await Withdrawal.findOne({ _id: id });

    if (!withdrawal) {
      return res
        .status(404)
        .json({ success: false, message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Withdrawal already processed" });
    }

    withdrawal.status = "success";
    withdrawal.referenceNumber = referenceNumber;
    withdrawal.approvedAt = new Date();

    await withdrawal.save();

    return res.status(200).json({
      success: true,
      message: "Withdrawal approved successfully",
      data: withdrawal,
    });
  } catch (error) {
    console.error("Approval Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/singleUserWithdrawnAldGroup", async (req, res) => {
  const { user } = req.query;
  try {
    let data = await User.findOne({ userId: user });

    if (!data) {
      data = await User.findOne({ phone: user });
      if (!data) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
    }
    // res.json({data});
    const withdrawals = await Withdrawal.find({ userId: data.userId }).sort({
      createdAt: 1,
    });
    if (!withdrawals) {
      return res.status(404).json({
        success: false,
        message: "No withdrawals found for this user",
      });
    }
    let total = 0;
    for (let i = 0; i < withdrawals.length; i++) {
      total += withdrawals[i].amount;
    }
    res.json({ data: withdrawals, totalWithdrawn: total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/allReferralListAldGroup", async (req, res) => {
  try {
    const data = await Referral.find().sort({ createdAt: 1 });
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "No referrals found" });
    }
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      total += data[i].bonusAmount;
      total += 50;
    }
    res.json({ data, totalReferralBonus: total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/adminInfo", async (req, res) => {
  try {
    const [
      totalUsers,
      totalPendingWithdrawals,
      totalSuccessWithdrawals,
      totalInvestmentDocs,
      cashbackDocs,
      referralDocs,
    ] = await Promise.all([
      User.countDocuments(),
      Withdrawal.countDocuments({ status: "pending" }),
      Withdrawal.countDocuments({ status: "success" }),
      Order.find({}, "totalAmount"), // only fetch totalAmount
      Cashback.find({}, "amount"), // only fetch amount
      Referral.find({}, "bonusAmount"), // only fetch bonusAmount
    ]);

    const totalInvestmentAmount = totalInvestmentDocs.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );
    const totalCashback = cashbackDocs.reduce((sum, c) => sum + c.amount, 0);
    const totalReferralBonus = referralDocs.reduce(
      (sum, r) => sum + r.bonusAmount + 50,
      0
    );

    res.json({
      totalUsers,
      totalPendingWithdrawals,
      totalSuccessWithdrawals,
      totalInvestmentAmount,
      totalCashback,
      totalReferralBonus,
    });
  } catch (error) {
    console.error("adminInfo error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/getAllPayments", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    if (!orders) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }
    res.json({ data: orders, totalOrders: orders.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/getOrders", async (req, res) => {
  try {
    const orders = await Order.find({
      onlyBuy: true,
      paymentStatus: true,
    }).sort({ createdAt: -1 });
    if (!orders) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }
    res.json({ data: orders, totalOrders: orders.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
router.get("/getInvestment", async (req, res) => {
  try {
    const orders = await Order.find({
      onlyBuy: false,
      paymentStatus: true,
    }).sort({ createdAt: -1 });
    if (!orders) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }
    res.json({ data: orders, totalOrders: orders.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.post("/verify-payment", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { paymentStatus: true } },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const userId = order.user;

    const userOrders = await Order.find({ user: userId });

    if (userOrders.length === 1) {
      const details = await User.findOne({ userId });

      if (!details) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // let walletBonus = 0;
      let referrer = null;


      if (details.referralCode) {

        referrer = await User.findOne({ userId: details.referralCode });

        if (!referrer) {
          return res.status(400).json({
            success: false,
            message: "Invalid referral code",
          });
        }

        await details.save();

        referrer.referralBonus += userOrders.totalAmount*.08;
        referrer.walletBalance += userOrders.totalAmount*.08;
        await referrer.save();

        await Referral.create({
          referrer: referrer.userId,
          referee: details.userId,
          bonusAmount: 100,
          status: "credited",
          creditedAt: new Date(),
        });
      } else {
        console.log("No referral code found, skipping referral logic.");
      }
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
});


router.post("/dispatch-purchase", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { orderStatus: "Shipped" } },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Purchase dispatch successfully",
      order,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    const adminCred = await AdminCred.findOne({ email });

    if (!adminCred || adminCred.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.json({ success: true, message: "Login successful", data: adminCred });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
