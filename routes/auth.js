const express = require('express');
const router = express.Router();
const { register, login, requestOtp, verifyOtp } = require('../controllers/authController');

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);

module.exports = router;