const Order = require('../models/Order');
const Product = require('../models/Product');
const { creditReferralBonuses } = require('../services/referralService');

exports.createOrder = async (req, res) => {
  try {
    const { products, shippingAddress } = req.body;
    const userId = req.user._id;
    
    // Verify products and calculate total
    let totalAmount = 0;
    const orderProducts = [];
    
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Product ${product?.name || ''} not available in required quantity` 
        });
      }
      
      const productTotal = product.price * item.quantity;
      totalAmount += productTotal;
      
      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        cashbackPercentage: product.cashbackPercentage,
        cashbackDuration: product.cashbackDuration
      });
    }
    
    const order = new Order({
      user: userId,
      products: orderProducts,
      totalAmount,
      shippingAddress
    });
    
    await order.save();
    
    // Update product stock
    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }
    
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('products.product')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};