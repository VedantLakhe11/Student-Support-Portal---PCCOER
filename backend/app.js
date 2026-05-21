const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// 1. Enable Secure HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows React client to fetch static images
  })
);

// 2. Logging Middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 3. Enable CORS
const allowedOrigins = [
  'http://localhost:5173', // Vite standard dev server port
  'http://127.0.0.1:5173',
  'http://localhost:5174', // Additional local dev port used by React
  'http://127.0.0.1:5174',
  'https://student-support-portal-pccoer.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// 4. Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Rate Limiting for overall API protection (except uploads if necessary, but standard limit is great)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter);

// 6. Serve static upload folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 7. Core Route Declarations
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/university', require('./routes/universityRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/forum', require('./routes/forumRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/marketplace', require('./routes/marketplaceRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// Root endpoint for simple health-checks
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Smart Complaint Management System API',
    status: 'Healthy',
  });
});

// 8. Capture invalid endpoints (404s) and feed into Error Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
