const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { storage } = require('../config/cloudinary');
const { createLoginLimiter } = require('../config/rate-limit');
const { getEnvironmentConfig } = require('../config/environment');
const { normalizeAdminUsername, verifyAdminPassword } = require('../services/admin-credentials');
const { createUploadMiddleware, sendUploadError, UploadStorageError } = require('../middleware/upload');

// Models
const Admin = require('../models/Admin');
const Event = require('../models/Event');
const Team = require('../models/Team');
const {
    RequestValidationError,
    assertValidId,
    sanitizeCredentials,
    sanitizeEvent,
    sanitizeTeam,
} = require('./admin.validation');
const {
    MemberRequestValidationError,
    sanitizeGoogleAuthorization,
    sanitizeProvisioning,
} = require('./member.validation');
const {
    authorizeMemberGoogleEmail,
    provisionMemberAccount,
    revokeMemberGoogleEmail,
} = require('../services/member-provisioning');
const { createAdminToken } = require('../services/admin-auth');

const upload = createUploadMiddleware(storage);

// Strict Rate Limiter for Admin Login
// Purpose: Prevent brute force password guessing attacks
// Critical security measure for authentication endpoints
const loginLimiter = createLoginLimiter();

// Admin Login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { jwtSecret } = getEnvironmentConfig();
        if (!jwtSecret) return res.status(503).json({ message: 'Authentication is not configured' });

        const { username, password } = sanitizeCredentials(req.body);
        const normalizedUsername = normalizeAdminUsername(username);
        const admin = await Admin.findOne({ username: normalizedUsername });

        if (admin && await verifyAdminPassword(password, admin.password)) {
            const token = createAdminToken({ username: normalizedUsername }, jwtSecret);
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        if (error instanceof RequestValidationError) {
            return res.status(400).json({ message: error.message });
        }
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
router.post('/upload', auth, (req, res) => {
    upload.single('image')(req, res, (error) => {
        if (error) return sendUploadError(res, error);
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        if (typeof req.file.path !== 'string' || !/^https?:\/\//i.test(req.file.path)) {
            return sendUploadError(res, new UploadStorageError('Image storage did not return a valid image URL.'));
        }
        return res.json({ url: req.file.path }); // req.file.path is the Cloudinary URL
    });
});

// Provisioning is intentionally administrator-only. The one-time activation
// secret is returned once so the administrator can deliver it through the
// branch's approved channel; it is never stored or logged in plaintext.
router.post('/members/provision', auth, async (req, res) => {
    try {
        // Load the account model only when this administrator-only operation is
        // used. This keeps the existing CLI/login test doubles independent of
        // the member account schema.
        const Member = require('../models/Member');
        const { username, teamId } = sanitizeProvisioning(req.body);
        const { activationToken, member } = await provisionMemberAccount({
            MemberModel: Member,
            TeamModel: Team,
            username,
            teamId,
        });

        return res.status(201).json({
            member: {
                id: member._id,
                username: member.username,
                status: member.status,
                teamId: member.teamId,
                activationExpiresAt: member.activationExpiresAt,
            },
            activationToken,
        });
    } catch (error) {
        if (error instanceof MemberRequestValidationError) {
            return res.status(400).json({ message: error.message });
        }
        if (error.code === 'TEAM_NOT_FOUND') return res.status(404).json({ message: error.message });
        if (error.code === 'ACCOUNT_EXISTS' || error.code === 11000) {
            return res.status(409).json({ message: 'A member account or team link already exists' });
        }
        return res.status(500).json({ message: 'Unable to provision member account' });
    }
});

// Volunteer Google sign-in: administrators authorize one Google account email
// per Team profile. Only authorized emails can sign in with Google.
router.get('/members/google', auth, async (req, res) => {
    try {
        const Member = require('../models/Member');
        const members = await Member.find({ email: { $exists: true } }, 'teamId email status');
        res.json(members.map(member => ({
            teamId: String(member.teamId),
            email: member.email,
            status: member.status,
        })));
    } catch (error) {
        res.status(500).json({ message: 'Unable to fetch volunteer Google access' });
    }
});

router.put('/members/:teamId/google', auth, async (req, res) => {
    try {
        const Member = require('../models/Member');
        const teamId = String(assertValidId(req.params.teamId, 'team member'));
        const { email } = sanitizeGoogleAuthorization(req.body);
        const member = await authorizeMemberGoogleEmail({ MemberModel: Member, TeamModel: Team, teamId, email });
        res.json({ teamId, email: member.email, status: member.status });
    } catch (error) {
        if (error instanceof RequestValidationError || error instanceof MemberRequestValidationError) {
            return res.status(400).json({ message: error.message });
        }
        if (error.code === 'TEAM_NOT_FOUND') return res.status(404).json({ message: error.message });
        if (error.code === 'EMAIL_IN_USE' || error.code === 11000) {
            return res.status(409).json({ message: 'This email is already authorized for another member' });
        }
        res.status(500).json({ message: 'Unable to authorize volunteer email' });
    }
});

router.delete('/members/:teamId/google', auth, async (req, res) => {
    try {
        const Member = require('../models/Member');
        const teamId = String(assertValidId(req.params.teamId, 'team member'));
        const member = await revokeMemberGoogleEmail({ MemberModel: Member, teamId });
        if (!member) return res.status(404).json({ message: 'No authorized email for this member' });
        res.json({ message: 'Volunteer Google access removed' });
    } catch (error) {
        if (error instanceof RequestValidationError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Unable to remove volunteer Google access' });
    }
});

// CRUD for Events
router.post('/events', auth, async (req, res) => {
    try {
        const newEvent = new Event(sanitizeEvent(req.body));
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/events/:id', auth, async (req, res) => {
    try {
        const id = String(assertValidId(req.params.id, 'event'));
        const updatedEvent = await Event.findByIdAndUpdate(id, sanitizeEvent(req.body, { partial: true }), { new: true, runValidators: true });
        if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/events/:id', auth, async (req, res) => {
    try {
        const id = String(assertValidId(req.params.id, 'event'));
        const result = await Event.findByIdAndDelete(id);
        if (!result) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted' });
    } catch (error) {
        if (error instanceof RequestValidationError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});

// CRUD for Team
router.post('/team', auth, async (req, res) => {
    try {
        const newMember = new Team(sanitizeTeam(req.body));
        await newMember.save();
        res.status(201).json(newMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/team/:id', auth, async (req, res) => {
    try {
        const id = String(assertValidId(req.params.id, 'team member'));
        const updatedMember = await Team.findByIdAndUpdate(id, sanitizeTeam(req.body, { partial: true }), { new: true, runValidators: true });
        if (!updatedMember) return res.status(404).json({ message: 'Member not found' });
        res.json(updatedMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/team/:id', auth, async (req, res) => {
    try {
        const id = String(assertValidId(req.params.id, 'team member'));
        const result = await Team.findByIdAndDelete(id);
        if (!result) return res.status(404).json({ message: 'Member not found' });
        res.json({ message: 'Member deleted' });
    } catch (error) {
        if (error instanceof RequestValidationError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
