const { getEnvironmentConfig } = require('../config/environment');
const {
    ADMIN_TOKEN_PURPOSE,
    verifyAdminToken,
} = require('../services/admin-auth');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const { jwtSecret } = getEnvironmentConfig();
        if (!jwtSecret) {
            return res.status(503).json({ message: 'Authentication is not configured' });
        }
        const decoded = verifyAdminToken(token, jwtSecret);
        if (decoded?.purpose !== ADMIN_TOKEN_PURPOSE) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;
