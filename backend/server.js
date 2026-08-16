import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://ranjitbhandary.me',
  'https://www.ranjitbhandary.me',
].filter(Boolean);

// Middleware
app.use(helmet());
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/', limiter);

// Import routes
import projectRoutes from './routes/projects.js';
import contactRoutes from './routes/contact.js';
import analyticsRoutes from './routes/analytics.js';
import { cleanupAnalytics } from './services/analytics.js';

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/analytics', analyticsRoutes);

// Retention runs independently of requests. Failures are logged but never affect
// the portfolio API; the next scheduled run will retry.
const cleanupIntervalMs = 24 * 60 * 60 * 1000;
const runAnalyticsCleanup = () => cleanupAnalytics().catch((error) => console.error('Analytics cleanup failed:', error.message));
runAnalyticsCleanup();
setInterval(runAnalyticsCleanup, cleanupIntervalMs).unref();

// Root diagnostic route - useful for deployment checks. Reports whether the
// database is configured so missing DATABASE_URL is immediately visible.
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'portfolio-backend',
      status: 'ok',
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      timestamp: new Date().toISOString()
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Request error:', err.message);
  const status = err.status || 500;
  const message = status >= 500 ? 'Something went wrong. Please try again later.' : err.message;
  
  res.status(status).json({ 
    success: false, 
    message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
});

export default app;
