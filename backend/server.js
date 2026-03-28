require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Rate Limiter: Apply to all /api routes
// Purpose: Prevent abuse by limiting requests per IP address
// Protects against brute force attacks and DoS
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: JSON.stringify({ message: 'Too many requests from this IP, please try again after 15 minutes' }),
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req) => req.path === '/', // Don't rate limit health check
});

// Database Connection
if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'pending') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('Connected to MongoDB Atlas');
      // Auto-initialize Admin if empty
      const Admin = require('./models/Admin');
      const AdminCount = await Admin.countDocuments();
      if (AdminCount === 0) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        await Admin.create({ username: 'admin', password: hashedPassword });
        console.log('Default admin user initialized (admin/admin123)');
      }
    })
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('⚠️ No MONGODB_URI provided. Running in mock/disconnected mode.');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply global rate limiter to all /api routes
app.use('/api', globalLimiter);

// API Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('IEEE Website Backend is Running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
