const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['clothes', 'accessories', 'furniture'], required: true },
  images: [String],
  stock: { type: Number, default: 0 },
  cashbackPercentage: { type: Number, default: 0 },
  cashbackDuration: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);