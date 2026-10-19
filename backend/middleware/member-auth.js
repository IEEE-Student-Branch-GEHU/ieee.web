const mongoose = require('mongoose');
const { getEnvironmentConfig } = require('../config/environment');
const Member = require('../models/Member');
const Team = require('../models/Team');
const {
  MEMBER_TOKEN_PURPOSE,
  verifyMemberToken,
} = require('../services/member-auth');

const getBearerToken = (header) => {
  if (typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+([^\s]+)$/i);
  return match ? match[1] : null;
};

const memberAuth = async (req, res, next) => {
  const token = getBearerToken(req.header('Authorization'));
  if (!token) return res.status(401).json({ message: 'Member authentication required' });

  try {
    const { jwtSecret } = getEnvironmentConfig();
    if (!jwtSecret) return res.status(503).json({ message: 'Authentication is not configured' });

    const decoded = verifyMemberToken(token, jwtSecret);
    if (decoded.purpose !== MEMBER_TOKEN_PURPOSE
      || typeof decoded.sub !== 'string'
      || !mongoose.isObjectIdOrHexString(decoded.sub)
      || typeof decoded.teamId !== 'string'
      || !mongoose.isObjectIdOrHexString(decoded.teamId)) {
      return res.status(401).json({ message: 'Member token is not valid' });
    }

    const member = await Member.findById(decoded.sub);
    const team = await Team.findById(decoded.teamId);
    if (!member
      || !team
      || member.status !== 'active'
      || String(member.teamId) !== decoded.teamId
      || Number(member.tokenVersion || 0) !== Number(decoded.ver || 0)) {
      return res.status(401).json({ message: 'Member token is not valid' });
    }

    req.member = member;
    req.memberToken = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Member token is not valid' });
  }
};

module.exports = { getBearerToken, memberAuth };
