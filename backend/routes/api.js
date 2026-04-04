const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Models
const Event = require('../models/Event');
const Team = require('../models/Team');
const mongoose = require('mongoose');

// Contact Form Rate Limiter (Issue #23)
// Purpose: Prevent spam abuse of the public contact endpoint
// Stricter than the global limiter (5 vs 100 requests per window)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15-minute window
  max: 5,                     // 5 contact submissions per IP per window
  message: { message: 'Too many contact requests from this IP, please try again later.' },
  standardHeaders: true,      // Return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,       // Disable X-RateLimit-* headers
});

// Get all events (with pagination and filters)
router.get('/events', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ events: [], totalPages: 0 });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const onLandingPage = req.query.onLandingPage === 'true';
    const category = req.query.category || 'All';

    const query = {};
    if (onLandingPage) query.onLandingPage = true;
    if (search) {
      query.$or = [
        { title: { $regex: String(search), $options: 'i' } },
        { description: { $regex: String(search), $options: 'i' } }
      ];
    }
    if (category && category !== 'All') {
      query.category = { $eq: String(category) };
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

// Get all team members (with filtering and sorting — Issue #41)
router.get('/team', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);
    
    const { year, category, onLandingPage } = req.query;
    const query = {
      ...(year && { year: { $eq: String(year) } }),
      ...(category && category !== 'All' && { category: { $eq: String(category) } }),
      ...(onLandingPage === 'true' && { onLandingPage: true })
    };

    // Sorting: rank (0 is highest) then createdAt
    const team = await Team.find(query).sort({ rank: 1, name: 1 });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all unique session years (Issue #41)
router.get('/team/years', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const years = await Team.distinct('year');
    // Sort years descending (latest first)
    const sortedYears = years.sort((a, b) => b.localeCompare(a));
    res.json(sortedYears);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Contact Form (Rate Limited — Issue #23)
router.post('/contact', contactLimiter, (req, res) => {
  console.log('Contact form received:', req.body);
  res.json({ message: 'Thank you for your message. We will get back to you soon!' });
});

module.exports = router;
