const express = require('express');
const Support = require('../models/Support');
const router = express.Router();

// router.use(protect);

router.post('/create-ticket', async (req, res) => {
    try {
        const { name, number, subject, issueType, message } = req.body;
    
        // Validate required fields
        if (!name || !number || !subject || !issueType || !message) {
          return res.status(400).json({
            success: false,
            message: 'All fields are required',
          });
        }
    
        const newTicket = await Support.create({
          name,
          number,
          subject,
          issueType,
          message,
        });
    
        res.status(200).json({
          success: true,
          message: 'Support ticket created successfully',
          ticket: newTicket,
        });
      } catch (error) {
        console.error('Create Ticket Error:', error);
        res.status(500).json({
          success: false,
          message: 'Server error',
        });
      }
    });

module.exports = router;