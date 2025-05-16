const express = require('express');
const User = require('../models/User');
const router = express.Router();


router.get("/allUsers", async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: 1 });
        res.json({data: users,totalUsers: users.length});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
})

router.get("/singleUser",async (req, res) => {
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

module.exports = router;