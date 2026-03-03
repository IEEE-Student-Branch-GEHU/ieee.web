const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
