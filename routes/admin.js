const express = require('express');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const Referral = require('../models/Referral');
const router = express.Router();


router.get("/allUsersAldGroup", async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: 1 });
        res.json({data: users,totalUsers: users.length});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
})

router.get("/singleUserAldGroup",async (req, res) => {
    const { user } = req.query;
    try {
        let data = await User.findOne({ userId: user });

        if (!data) {
            data = await User.findOne({ phone: user });    
            if (!data) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
        }
        res.json({data});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
})

router.get("/totalWithdrawnAldGroup", async (req, res) => {
    try {
        const data = await Withdrawal.find().sort({ createdAt: 1 });
        if (!data) {
            return res.status(404).json({ success: false, message: 'No withdrawals found' });
        }
        let total = 0;
        for (let i = 0; i < data.length; i++) {
            total += data[i].amount;
        }
        res.json({data, totalWithdrawn: total });
    } catch(error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });  
    }
})

router.get("/singleUserWithdrawnAldGroup",async (req, res) => {
    const { user } = req.query;
    try {
        let data = await User.findOne({ userId: user });

        if (!data) {
            data = await User.findOne({ phone: user });    
            if (!data) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
        }
        // res.json({data});
        const withdrawals = await Withdrawal.find({ userId: data.userId }).sort({ createdAt: 1 });
        if (!withdrawals) {
            return res.status(404).json({ success: false, message: 'No withdrawals found for this user' });
        }
        let total = 0;
        for (let i = 0; i < withdrawals.length; i++) {
            total += withdrawals[i].amount;
            total += 50;
        }
        res.json({data: withdrawals, totalWithdrawn: total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
})

router.get("/allReferralListAldGroup", async (req, res) => {
    try {
        const data = await Referral.find().sort({createdAt: 1});
        if (!data) {
            return res.status(404).json({ success: false, message: 'No referrals found' });
        }
        let total = 0;
        for (let i = 0; i < data.length; i++) {
            total += data[i].bonusAmount;
        }
        res.json({data, totalReferralBonus: total });
    } catch(error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
})

module.exports = router;