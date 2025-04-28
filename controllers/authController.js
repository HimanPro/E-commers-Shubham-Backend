const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { processReferral } = require('../services/referralService');

const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.NodeMailer_Email,
    pass: process.env.NodeMailer_Password
  },
});

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

exports.requestOtp = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and Email are required' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    name,
  };
console.log(otpStore, "otpStore")
  try {
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Hello ${name},\n\nYour OTP code is: ${otp}\n\nIt will expire in 10 minutes.`,
    });

    res.json({ success: true, message: 'OTP sent successfully to email' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP email' });
  }
};
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const record = otpStore[email];
  if (!record) {
    return res.status(400).json({ success: false, message: 'No OTP requested for this email' });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: 'OTP expired' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  delete otpStore[email];

  res.json({ success: true, message: 'Otp verified', user: { name: record.name, email } });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, bankDetails } = req.body;

    // Check all required fields
    if (!name || !email || !phone || !bankDetails) {
      return res.status(400).json({ success: false, message: "Name, Email, Phone, and Bank Details are required" });
    }

    // Validate phone number
    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    }

    const { accountHolderName, bankName, accountNumber, ifscCode } = bankDetails;

    // Check required bank fields
    if (!accountHolderName || !bankName || !accountNumber || !ifscCode) {
      return res.status(400).json({ success: false, message: "Incomplete bank details" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      bankDetails: {
        accountHolderName,
        bankName,
        accountNumber,
        ifscCode
      }
    });

    res.status(201).json({ success: true, message: "Registration successful", user });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });
    
    res.status(200).json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};