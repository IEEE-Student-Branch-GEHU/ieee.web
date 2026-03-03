const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const auth = require('../middleware/auth');

const ADMIN_FILE = path.join(__dirname, '../data/admins.json');
const EVENTS_FILE = path.join(__dirname, '../data/events.json');
const TEAM_FILE = path.join(__dirname, '../data/team.json');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure directories and files exist
if (!fs.existsSync(path.join(__dirname, '../data'))) fs.mkdirSync(path.join(__dirname, '../data'));
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(ADMIN_FILE)) {
    // Default admin: admin / admin123
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    fs.writeFileSync(ADMIN_FILE, JSON.stringify([{ username: 'admin', password: hashedPassword }]));
}

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Helper to read/write JSON files
const getData = (file) => {
    if (!fs.existsSync(file)) return [];
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
    } catch (e) {
        return [];
    }
};
const saveData = (file, data) => {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Admin Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const admins = getData(ADMIN_FILE);
    const admin = admins.find(a => a.username === username);

    if (admin && bcrypt.compareSync(password, admin.password)) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET || 'ieee_secret_key', { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Dashboard Stats
router.get('/stats', auth, (req, res) => {
    try {
        console.log(`[DEBUG] Received stats request from admin: ${req.admin.username}`);
        const events = getData(EVENTS_FILE);
        const team = getData(TEAM_FILE);
        const MESSAGES_FILE = path.join(__dirname, '../data/messages.json');
        const messages = getData(MESSAGES_FILE);

        res.json({
            eventsCount: events.length,
            teamCount: team.length,
            messagesCount: messages.length,
            recentActivity: [
                ...events.slice(-2).map(e => ({ type: 'event', text: `New event "${e.title}" added`, date: e.id })),
                ...team.slice(-2).map(t => ({ type: 'team', text: `Team member "${t.name}" added/updated`, date: t.id }))
            ].sort((a, b) => b.date - a.date)
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// Image Upload
router.post('/upload', auth, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: `/uploads/${req.file.filename}` });
});

// CRUD for Events
router.post('/events', auth, (req, res) => {
    const events = getData(EVENTS_FILE);
    const newEvent = { id: Date.now(), ...req.body };
    events.push(newEvent);
    saveData(EVENTS_FILE, events);
    res.status(201).json(newEvent);
});

router.put('/events/:id', auth, (req, res) => {
    const events = getData(EVENTS_FILE);
    const index = events.findIndex(e => e.id?.toString() === req.params.id.toString());
    if (index === -1) return res.status(404).json({ message: 'Event not found' });
    events[index] = { ...events[index], ...req.body };
    saveData(EVENTS_FILE, events);
    res.json(events[index]);
});

router.delete('/events/:id', auth, (req, res) => {
    let events = getData(EVENTS_FILE);
    events = events.filter(e => e.id?.toString() !== req.params.id.toString());
    saveData(EVENTS_FILE, events);
    res.json({ message: 'Event deleted' });
});

// CRUD for Team
router.post('/team', auth, (req, res) => {
    const team = getData(TEAM_FILE);
    const newMember = { id: Date.now(), ...req.body };
    team.push(newMember);
    saveData(TEAM_FILE, team);
    res.status(201).json(newMember);
});

router.put('/team/:id', auth, (req, res) => {
    const team = getData(TEAM_FILE);
    const index = team.findIndex(t => t.id?.toString() === req.params.id.toString());
    if (index === -1) return res.status(404).json({ message: 'Member not found' });
    team[index] = { ...team[index], ...req.body };
    saveData(TEAM_FILE, team);
    res.json(team[index]);
});

router.delete('/team/:id', auth, (req, res) => {
    let team = getData(TEAM_FILE);
    team = team.filter(t => t.id?.toString() !== req.params.id.toString());
    saveData(TEAM_FILE, team);
    res.json({ message: 'Member deleted' });
});

module.exports = router;
