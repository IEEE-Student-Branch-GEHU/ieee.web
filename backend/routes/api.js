const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Helper to read data
const readData = (filename) => {
    const filePath = path.join(__dirname, '..', 'data', filename);
    if (!fs.existsSync(filePath)) return [];
    try {
        const rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    } catch (e) {
        return [];
    }
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
    try {
        const { firstName, lastName, email, message } = req.body;
        const MESSAGES_FILE = path.join(__dirname, '..', 'data', 'messages.json');

        // Ensure data dir exists
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

        let messages = [];
        if (fs.existsSync(MESSAGES_FILE)) {
            messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8') || '[]');
        }

        const newMessage = {
            id: Date.now(),
            firstName,
            lastName,
            email,
            message,
            timestamp: new Date().toISOString()
        };

        messages.push(newMessage);
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));

        console.log('--- New Contact Form Submission Logged ---');
        console.log(`Name: ${firstName} ${lastName}`);
        console.log(`Email: ${email}`);
        res.json({ success: true, message: 'Message received and logged successfully!' });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ success: false, message: 'Failed to process message' });
    }
});

module.exports = router;
