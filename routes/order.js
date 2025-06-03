const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { createOrder, getCashback, verifyPayment } = require('../controllers/orderController');

router.use(protect);

router.post('/dispatch-order', createOrder);
// router.post("/verify-payment", verifyPayment);
router.get('/getCashback', getCashback);

module.exports = router;