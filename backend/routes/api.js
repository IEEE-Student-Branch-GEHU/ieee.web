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

// Escapes special regex metacharacters to treat user input as a literal substring
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

    const eventsQuery = {};
    if (onLandingPage === true) eventsQuery.onLandingPage = { $eq: true };
    if (typeof search === 'string' && search.length > 0) {
      const safeSearch = escapeRegex(search);
      eventsQuery.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } }
      ];
    }
    if (typeof category === 'string' && category !== 'All') {
      eventsQuery.category = { $eq: String(category) };
    }

    const totalEvents = await Event.countDocuments(eventsQuery);
    const events = await Event.find(eventsQuery)
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

    const query = {};
    const { year, category, onLandingPage } = req.query;
    
    // Defensive Type Casting & Sanitization for NoSQL Injection Protection
    if (typeof year === 'string') {
      query.year = { $eq: year };
    }
    
    if (typeof category === 'string' && category !== 'All') {
      query.category = { $eq: category };
    }

    if (onLandingPage === 'true') {
      query.onLandingPage = { $eq: true };
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
