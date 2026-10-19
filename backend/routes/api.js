const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Models
const Event = require('../models/Event');
const Team = require('../models/Team');
const Certificate = require('../models/Certificate');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const {
  TEAM_LIST_PROJECTION,
  PUBLIC_TEAM_PROJECTION,
  YEAR_PATTERN,
  serializePublicTeamMember,
} = require('../validation/team-public');
const { serializeCertificate } = require('../validation/certificate-public');

const teamFilterKeys = new Set(['year', 'category', 'onLandingPage']);
class TeamQueryValidationError extends Error {}

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many contact requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getTeamFilter = (query) => {
  const filter = {};
  for (const key of Object.keys(query || {})) {
    if (!teamFilterKeys.has(key)) throw new TeamQueryValidationError(`Unsupported team filter: ${key}`);
    if (typeof query[key] !== 'string') throw new TeamQueryValidationError(`${key} must be a string`);
    if (key === 'year' && !YEAR_PATTERN.test(query[key])) {
      throw new TeamQueryValidationError('year must use YYYY-YYYY format');
    }
    if (key === 'category' && query[key] === 'All') continue;
    if (key === 'onLandingPage') {
      if (!['true', 'false'].includes(query[key])) {
        throw new TeamQueryValidationError('onLandingPage must be true or false');
      }
      filter[key] = query[key] === 'true';
    } else {
      filter[key] = query[key];
    }
  }
  return filter;
};

const compareTeamMembers = (left, right) => {
  const leftHasRank = typeof left.rank === 'number' && Number.isFinite(left.rank);
  const rightHasRank = typeof right.rank === 'number' && Number.isFinite(right.rank);
  if (leftHasRank !== rightHasRank) return leftHasRank ? -1 : 1;
  if (leftHasRank && left.rank !== right.rank) return left.rank - right.rank;

  if (!leftHasRank && left.order !== right.order) {
    const leftOrder = typeof left.order === 'number' ? left.order : 0;
    const rightOrder = typeof right.order === 'number' ? right.order : 0;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
  }

  return String(left.name || '').localeCompare(String(right.name || ''), 'en', { sensitivity: 'base' });
};

const sortTeamMembers = (members) => [...members].sort(compareTeamMembers);

// Get all events (with pagination and filters)
router.get('/events', async (req, res) => {
  try {
    for (const field of ['page', 'limit', 'search', 'category', 'onLandingPage']) {
      if (req.query[field] !== undefined && typeof req.query[field] !== 'string') {
        return res.status(400).json({ message: `${field} must be a string` });
      }
    }

    if (req.query.search && req.query.search.length > 200) {
      return res.status(400).json({ message: 'search must be at most 200 characters' });
    }
    if (req.query.onLandingPage !== undefined && !['true', 'false'].includes(req.query.onLandingPage)) {
      return res.status(400).json({ message: 'onLandingPage must be true or false' });
    }

    if (mongoose.connection.readyState !== 1) return res.json({ events: [], totalPages: 0 });

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || 'All';

    const query = {};
    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } }
      ];
    }
    if (category !== 'All') {
      query.category = category;
    }
    if (req.query.onLandingPage === 'true') query.onLandingPage = true;

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

// Get all team member years. This route must remain before /team/:id.
router.get('/team/years', async (req, res) => {
  try {
    const filter = getTeamFilter(req.query);
    if (mongoose.connection.readyState !== 1) return res.json([]);

    const years = await Team.distinct('year', filter);
    const uniqueYears = [...new Set(years.filter((year) => typeof year === 'string' && YEAR_PATTERN.test(year)))];
    uniqueYears.sort((left, right) => right.localeCompare(left));
    return res.json(uniqueYears);
  } catch (error) {
    if (error instanceof TeamQueryValidationError) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Unable to fetch team years' });
  }
});

// Get all team members
router.get('/team', async (req, res) => {
  try {
    const filter = getTeamFilter(req.query);
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const team = await Team.find(filter, TEAM_LIST_PROJECTION).sort({ rank: 1, name: 1, order: 1 });
    return res.json(sortTeamMembers(team).map(serializePublicTeamMember));
  } catch (error) {
    if (error instanceof TeamQueryValidationError) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Unable to fetch team members' });
  }
});

// Public certificate metadata is deliberately separate from the public member
// profile. A certificate becomes visible only when its owner explicitly sets
// visibility to "public"; private records are never selected here.
router.get('/team/:id/certificates', async (req, res) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: 'Invalid team member ID' });
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Certificate service unavailable' });

    const member = await Team.findById(id, '_id');
    if (!member) return res.status(404).json({ message: 'Team member not found' });

    const query = Certificate.find({ teamId: id, visibility: 'public' }).sort({ createdAt: -1 });
    const certificates = await (typeof query.select === 'function' ? query.select('+storage') : query);
    return res.json(certificates.map(certificate => serializeCertificate(certificate, {
      cloudinary,
      includeDownloadUrl: true,
    })));
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch public certificates' });
  }
});

// Get one team member by the stable MongoDB _id.
router.get('/team/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: 'Invalid team member ID' });
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Team service unavailable' });

    const member = await Team.findById(id, PUBLIC_TEAM_PROJECTION);
    if (!member) return res.status(404).json({ message: 'Team member not found' });
    return res.json(serializePublicTeamMember(member));
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch team member' });
  }
});

// Contact form endpoint is intentionally rate limited to reduce spam abuse.
router.post('/contact', contactLimiter, (req, res) => {
  res.json({ message: 'Thank you for your message. We will get back to you soon!' });
});

module.exports = router;
