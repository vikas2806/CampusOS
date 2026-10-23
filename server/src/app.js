const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const { CLIENT_URL } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// cors
app.use(cors({
  origin: CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CampusOS API' });
});

// routes
app.use('/api/auth', require('./routes/auth'));


// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// global error handler
app.use(errorHandler);

module.exports = app;
