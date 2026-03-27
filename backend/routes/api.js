const express = require('express');
const router = express.Router();

// Models
const Event = require('../models/Event');
const Team = require('../models/Team');
const mongoose = require('mongoose');

// Get all events
router.get('/events', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all team members
router.get('/team', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const team = await Team.find().sort({ order: 1 });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mock Contact Form
router.post('/contact', (req, res) => {
  console.log('Contact form received:', req.body);
  res.json({ message: 'Thank you for your message. We will get back to you soon!' });
});

module.exports = router;
