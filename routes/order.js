const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { createOrder, getUserOrders, getCashback } = require('../controllers/orderController');

router.use(protect);

router.post('/dispatch-order', createOrder);
router.get('/getCashback', getCashback);

module.exports = router;