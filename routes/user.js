const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { 
  getUserProfile, 
  updateProfile,
  requestWithdrawal,
  withdrawalReport,
  referralReport
} = require('../controllers/userController');

router.use(protect);

router.get('/profile', getUserProfile);
router.put('/me', updateProfile);
router.post('/withdraw', requestWithdrawal);
router.get('/withdrawReport', withdrawalReport);
router.get('/referralReport', referralReport);



module.exports = router;