const Cashback = require("../models/Cashback");
const Order = require("../models/Order");
const Referral = require("../models/Referral");
const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");

exports.getUserProfile = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required" });
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const referrer = await Referral.find({ referrer: userId });
    const cashback = await Cashback.find({ user: userId });
    const refAmount = referrer.reduce((acc, curr) => acc + curr.bonusAmount, 0);
    const cashBack = cashback.reduce((acc, curr) => acc + curr.amount, 0);

    const userWithRefInfo = {
      ...user.toObject(), 
      refCount: referrer.length,
      refAmount: refAmount,
      cashBackAmt: cashBack,
    };

    user.totalEarned = cashBack + refAmount;
    user.save();

    res.status(200).json({ success: true, user: userWithRefInfo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.query;
    const updateData = { ...req.body };

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    delete updateData.UserId;
    delete updateData.referralCode;

    const user = await User.findOneAndUpdate({ userId }, updateData, {
      new: true,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, userId } = req.body;
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // if (user.walletBalance < 110) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "You must have at least ₹110 in wallet to withdraw.",
    //   });
    // }

    if (amount > user.walletBalance) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance.",
      });
    }

    // 🔒 Weekly Withdrawal Restriction Logic
    const lastWithdrawal = await Withdrawal.findOne({ userId }).sort({ createdAt: -1 });

    if (lastWithdrawal) {
      const lastDate = new Date(lastWithdrawal.createdAt);
      const now = new Date();
      const diffInDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

      if (diffInDays < 7) {
        return res.status(403).json({
          success: false,
          message: `You can only withdraw once every 7 days. Last withdrawal was ${diffInDays} day(s) ago.`,
        });
      }
    }

    // 🏦 Deduct from wallet and move to pendingWithdrawal
    user.walletBalance -= amount;
    user.totalWithdrawn += amount;
    await user.save();

    // 📝 Create withdrawal request
    const withdrawal = await Withdrawal.create({
      userId: user.userId,
      name: user.name,
      amount,
      bankDetails: {
        accountNumber: user.bankDetails.accountNumber,
        ifscCode: user.bankDetails.ifscCode,
        accountHolderName: user.bankDetails.accountHolderName,
      },
      status: "pending",
    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      withdrawal,
    });

  } catch (error) {
    console.error("Withdrawal request error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.withdrawalReport = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const withdrawals = await Withdrawal.find({ userId }).sort({
      requestedAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Withdrawal report fetched successfully",
      data: withdrawals,
    });
  } catch (error) {
    console.error("Withdrawal report error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
exports.referralReport = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const referrals = await Referral.find({
      referrer: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Referral report fetched successfully",
      data: referrals,
    });
  } catch (error) {
    console.error("Referral report error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.orderReport = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }
  try {
    const data = await Order.find({user: userId}).sort({createdAt: -1});
    if (!data) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }
    res.status(200).json({ success: true, data });
  } catch(error) {
    console.error("Order report error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
