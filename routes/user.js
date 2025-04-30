const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { 
  getUserProfile, 
  updateProfile,
  requestWithdrawal
} = require('../controllers/userController');
const User = require('../models/User');

router.use(protect);

router.get('/profile', getUserProfile);
router.put('/me', updateProfile);
router.post('/withdraw', requestWithdrawal);

module.exports = router;