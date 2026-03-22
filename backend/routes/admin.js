const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const auth = require('../middleware/auth');
const { storage } = require('../config/cloudinary');

// Models
const Admin = require('../models/Admin');
const Event = require('../models/Event');
const Team = require('../models/Team');

const upload = multer({ storage });

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username: String(username) }); // Issue #25: type-cast to prevent injection

        if (admin && bcrypt.compareSync(password, admin.password)) {
            const token = jwt.sign({ username }, process.env.JWT_SECRET || 'ieee_secret_key', { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Dashboard Stats
router.get('/stats', auth, async (req, res) => {
    try {
        const eventsCount = await Event.countDocuments();
        const teamCount = await Team.countDocuments();
        
        // In a real scenario, you might want a Message model too. For now, zero:
        const messagesCount = 0; 

        const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(2);
        const recentTeam = await Team.find().sort({ createdAt: -1 }).limit(2);

        res.json({
            eventsCount,
            teamCount,
            messagesCount,
            recentActivity: [
                ...recentEvents.map(e => ({ type: 'event', text: `New event "${e.title}" added`, date: e.createdAt })),
                ...recentTeam.map(t => ({ type: 'team', text: `Team member "${t.name}" added`, date: t.createdAt }))
            ].sort((a, b) => b.date - a.date)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// Image Upload (Directly returns Cloudinary URL)
router.post('/upload', auth, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: req.file.path }); // req.file.path is the Cloudinary URL
});

// CRUD for Events
router.post('/events', auth, async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/events/:id', auth, async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(String(req.params.id), req.body, { new: true }); // Issue #25
        if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/events/:id', auth, async (req, res) => {
    try {
        const result = await Event.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CRUD for Team
router.post('/team', auth, async (req, res) => {
    try {
        const newMember = new Team(req.body);
        await newMember.save();
        res.status(201).json(newMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/team/:id', auth, async (req, res) => {
    try {
        const updatedMember = await Team.findByIdAndUpdate(String(req.params.id), req.body, { new: true }); // Issue #25
        if (!updatedMember) return res.status(404).json({ message: 'Member not found' });
        res.json(updatedMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/team/:id', auth, async (req, res) => {
    try {
        const result = await Team.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: 'Member not found' });
        res.json({ message: 'Member deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
