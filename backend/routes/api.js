const express = require('express');
const router = express.Router();

// Models
const Event = require('../models/Event');
const Team = require('../models/Team');
const mongoose = require('mongoose');

// Get all events (with pagination and filters)
router.get('/events', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ events: [], totalPages: 0 });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || 'All';

    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category !== 'All') {
      query.category = category;
    }

    const totalEvents = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      events,
      currentPage: page,
      totalPages: Math.ceil(totalEvents / limit),
      totalEvents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all team members (with filtering for archive)
router.get('/team', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);

    // Defensive Type Casting & Sanitization for NoSQL Injection Protection
    const query = {};
    if (req.query.year) {
      query.year = String(req.query.year);
    }
    if (req.query.category && req.query.category !== 'All') {
      query.category = String(req.query.category);
    }

    const team = await Team.find(query).sort({ 
      rank: 1, 
      order: 1, 
      createdAt: -1 
    });
    
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
