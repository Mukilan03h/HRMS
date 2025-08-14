const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
// IMPORTANT: Replace with your actual MongoDB connection string.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hrm_solution';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('HRM Solution Backend is running.');
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/employee', require('./routes/employee'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/onduty', require('./routes/onduty'));
app.use('/api/loan', require('./routes/loan'));
app.use('/api/payroll', require('./routes/payroll'));

// Protected test route
const { auth } = require('./middleware/authMiddleware');
app.get('/api/test', auth, (req, res) => {
    res.json({ message: 'Welcome to the protected route!', user: req.user });
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
