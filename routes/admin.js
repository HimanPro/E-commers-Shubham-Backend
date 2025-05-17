const express = require('express');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const Referral = require('../models/Referral');
const Order = require('../models/Order');
const Cashback = require('../models/Cashback');
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

// POST /api/withdrawals/approve
router.post("/approveWithdrawals", async (req, res) => {
    const { id, referenceNumber } = req.body;

    // Validate inputs
    if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "Withdrawal ID is required" });
    }

    if (!referenceNumber || typeof referenceNumber !== "string") {
        return res.status(400).json({ success: false, message: "Reference number is required" });
    }

    // Example: Validate reference format (alphanumeric, 8–20 characters)
    const refRegex = /^[A-Za-z0-9]{8,20}$/;
    if (!refRegex.test(referenceNumber)) {
        return res.status(400).json({ success: false, message: "Invalid reference number format" });
    }

    try {
        const withdrawal = await Withdrawal.findOne({ _id: id });

        if (!withdrawal) {
            return res.status(404).json({ success: false, message: "Withdrawal not found" });
        }

        if (withdrawal.status !== "pending") {
            return res.status(400).json({ success: false, message: "Withdrawal already processed" });
        }

        withdrawal.status = "success";
        withdrawal.referenceNumber = referenceNumber;
        withdrawal.approvedAt = new Date();

        await withdrawal.save();

        return res.status(200).json({
            success: true,
            message: "Withdrawal approved successfully",
            data: withdrawal
        });

    } catch (error) {
        console.error("Approval Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
});




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
            total += 50;
        }
        res.json({data, totalReferralBonus: total });
    } catch(error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
})

router.get("/adminInfo", async (req, res) => {
    try {
        const [
            totalUsers,
            totalPendingWithdrawals,
            totalSuccessWithdrawals,
            totalInvestmentDocs,
            cashbackDocs,
            referralDocs
        ] = await Promise.all([
            User.countDocuments(),
            Withdrawal.countDocuments({ status: "pending" }),
            Withdrawal.countDocuments({ status: "success" }),
            Order.find({}, 'totalAmount'),      // only fetch totalAmount
            Cashback.find({}, 'amount'),        // only fetch amount
            Referral.find({}, 'bonusAmount')    // only fetch bonusAmount
        ]);

        const totalInvestmentAmount = totalInvestmentDocs.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalCashback = cashbackDocs.reduce((sum, c) => sum + c.amount, 0);
        const totalReferralBonus = referralDocs.reduce((sum, r) => sum + r.bonusAmount + 50, 0);

        res.json({
            totalUsers,
            totalPendingWithdrawals,
            totalSuccessWithdrawals,
            totalInvestmentAmount,
            totalCashback,
            totalReferralBonus
        });
    } catch (error) {
        console.error("adminInfo error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


router.get("/getOrders",async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        if (!orders) {
            return res.status(404).json({ success: false, message: 'No orders found' });
        }
        res.json({data: orders, totalOrders: orders.length });
    } catch(error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
})



module.exports = router;