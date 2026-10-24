const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { CLIENT_URL } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// security headers
app.use(helmet());

// logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// cors
const allowedOrigins = [
  CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // permissive for client proxies and dev
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api', generalLimiter);

// auth rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CampusOS API', timestamp: new Date().toISOString() });
});

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/events', require('./routes/events'));
app.use('/api/public', require('./routes/public'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/checkin', require('./routes/checkin'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/contact', require('./routes/contact'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// global error handler
app.use(errorHandler);

module.exports = app;
