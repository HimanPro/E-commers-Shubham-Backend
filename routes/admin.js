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

module.exports = router;