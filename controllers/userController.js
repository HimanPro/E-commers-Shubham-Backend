const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');

exports.getUserProfile = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }
  try {
    const user = await User.findOne({userId});
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.query;
    const updateData = { ...req.body };

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    delete updateData.UserId;
    delete updateData.referralCode;

    const user = await User.findOneAndUpdate(
      { userId },       
      updateData,         
      { new: true }     
    ); 

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
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
    const user = await User.findOne({userId});

    // Check minimum wallet balance requirement
    if (user.walletBalance < 110) {
      return res.status(400).json({
        success: false,
        message: "You must have at least ₹110 in wallet to withdraw."
      });
    }

    // Check requested amount vs wallet balance
    if (amount > user.walletBalance) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance."
      });
    }

    // Deduct from wallet and move to pendingWithdrawal
    user.walletBalance -= amount;
    user.pendingWithdrawal += amount;
    await user.save();

    // Create withdrawal request (pending)
    const withdrawal = await Withdrawal.create({
      userId: user.userId,
      name: user.name,
      amount,
      bankDetails: {
        accountNumber: user.bankDetails.accountNumber,
        ifscCode: user.bankDetails.ifscCode,
        accountHolderName: user.bankDetails.accountHolderName
      },
      status: "pending"
    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      withdrawal
    });

  } catch (error) {
    console.error("Withdrawal request error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
