const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { createOrder, getUserOrders } = require('../controllers/orderController');

router.use(protect);

router.post('/', createOrder);
router.get('/', getUserOrders);

module.exports = router;