const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/config");
const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const twilio = require("twilio");
const Referral = require("../models/Referral");

const accountSid = "ACfe483e3f616b089070f53d88efe3d5f8";
const authToken = "10343bdc8985a7a2d9fb066ca25f507b";
const twilioPhone = "+14433396743";

const client = twilio(accountSid, authToken);

const otpStore = {};

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.NodeMailer_Email,
    pass: process.env.NodeMailer_Password,
  },
});

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

exports.requestOtp = async (req, res) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res
      .status(400)
      .json({ success: false, message: "Name and Email are required" });
  }

  // const userExists = await User.findOne({ email });
  // if (userExists) {
  //   return res.status(400).json({ success: false, message: 'User already exists' });
  // }

  //   if (!isValidEmail(email)) {
  //     return res.status(400).json({ success: false, message: 'Invalid email format' });
  //   }

  const otp = crypto.randomInt(100000, 999999).toString();

  //   otpStore[email] = {
  //     otp,
  //     expiresAt: Date.now() + 10 * 60 * 1000,
  //     name,
  //   };
  // console.log(otpStore, "otpStore")
  try {
    const message = await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: twilioPhone,
      to: `+91${number}`, // For Indian numbers; use full international format
    });

    res.json({
      success: true,
      message: "OTP sent successfully to email",
      msg: message.sid,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send OTP email" });
  }
};
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  const record = otpStore[email];
  if (!record) {
    return res
      .status(400)
      .json({ success: false, message: "No OTP requested for this email" });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  delete otpStore[email];

  res.json({
    success: true,
    message: "Otp verified",
    user: { name: record.name, email },
  });
};


exports.register = async (req, res) => {
  try {
    const { details } = req.body;

    if (!details) {
      return res.status(400).json({
        success: false,
        message: "Name, Phone"
      });
    }

    const generateUserId = () => {
      const randomChars = (length, chars) =>
        Array.from({ length }, () =>
          chars.charAt(Math.floor(Math.random() * chars.length))
        ).join("");
    
      const letters = randomChars(3, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
      const digits = randomChars(3, "0123456789");
      const timestamp = Date.now().toString().slice(-3); // last 3 digits of timestamp
    
      return `ALD-${letters}${digits}-${timestamp}`;
    };
    

    const userId = generateUserId();

    let walletBonus = 0;

    // let referrer = null;
    // if (details.referralId) {
    //   referrer = await User.findOne({ userId: details.referralId });

    //   if (!referrer) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Invalid referral code",
    //     });
    //   }

    //   walletBonus = 50; 
    // }

    const user = await User.create({
      userId,
      name: details.name,
      phone: details.phoneNumber,
      password: details.password,
      referralCode: details.referralId || null,
      walletBalance: walletBonus,
      totalEarned: walletBonus,
      referralBonus: 0,
    });

    // if (referrer) {
    //   referrer.referralBonus += 100;
    //   await referrer.save();

    //   await Referral.create({
    //     referrer: referrer.userId,
    //     referee: user.userId,
    //     bonusAmount: 100,
    //     status: "credited",
    //     creditedAt: new Date(),
    //   });
    // }

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ phone: email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User Not Found" });
    }

    // If you have hashed passwords, compare here:
    // const isMatch = await user.matchPassword(password);
    // if (!isMatch) {
    //   return res.status(401).json({ success: false, message: "Invalid credentials" });
    // }

    if (user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Password" });
    }

    const token = jwt.sign({ id: user.userId }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    res.status(200).json({ success: true, token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
