const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { 
  getUserProfile, 
  updateProfile,
  requestWithdrawal
} = require('../controllers/userController');

router.use(protect);

router.get('/me', getUserProfile);
router.put('/me', updateProfile);
router.post('/withdraw', requestWithdrawal);

module.exports = router;