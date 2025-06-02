const mongoose = require('mongoose');

const SupportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  issueType: {
    type: String,
    required: true,
    default: 'general'
  },
  message: {
    type: String,
    required: true,
    trim: true,
  }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

// Optional: add text index for search
// SupportSchema.index({
//   subject: 'text',
//   message: 'text'
// });

const Support = mongoose.model('Support', SupportSchema);

module.exports = Support;
