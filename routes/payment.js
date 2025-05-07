const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController');

// router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify-order', verifyPayment);

module.exports = router;
