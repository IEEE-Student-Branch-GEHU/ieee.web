const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Helper to read data
const readData = (filename) => {
    const filePath = path.join(__dirname, '..', 'data', filename);
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
};

// GET /api/events
router.get('/events', (req, res) => {
    try {
        const events = readData('events.json');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// GET /api/team
router.get('/team', (req, res) => {
    try {
        const team = readData('team.json');
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team data' });
    }
});

// POST /api/contact
router.post('/contact', (req, res) => {
    const { firstName, lastName, email, message } = req.body;

    // Mock Email Sending logic
    console.log('--- New Contact Form Submission ---');
    console.log(`Name: ${firstName} ${lastName}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    console.log('-----------------------------------');

    res.json({ success: true, message: 'Message received successfully!' });
});

module.exports = router;
