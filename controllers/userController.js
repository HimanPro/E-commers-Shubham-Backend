const User = require('../models/User');

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

    // Find and update user
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
    const { amount, upiId } = req.body;
    const user = await User.findById(req.user._id);
    
    if (amount < config.minWithdrawalAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum withdrawal amount is ₹${config.minWithdrawalAmount}` 
      });
    }
    
    if (amount > user.walletBalance) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance' 
      });
    }
    
    user.walletBalance -= amount;
    user.totalWithdrawn += amount;
    await user.save();
    
    // In real app, you would create a withdrawal record and process it
    
    res.status(200).json({ 
      success: true, 
      message: 'Withdrawal request submitted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};