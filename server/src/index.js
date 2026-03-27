require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const dropsRouter = require('./routes/drops');
const brandsRouter = require('./routes/brands');
const usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ═══ SECURITY: Helmet — sets secure HTTP headers ═══
app.use(helmet({
  contentSecurityPolicy: false, // Let Next.js handle CSP
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow Cloudinary images
}));
app.disable('x-powered-by'); // Don't expose Express

// ═══ SECURITY: CORS — restrict origins ═══
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://dropout-eta.vercel.app',
    'https://dropamyn.com',
    'https://www.dropamyn.com',
    'http://localhost:3000',
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// ═══ SECURITY: Body size limits ═══
app.use(express.json({ limit: '1mb' })); // 1MB for text endpoints

// ═══ SECURITY: Global rate limiter — 100 req/min per IP ═══
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ═══ SECURITY: Strict rate limit for auth endpoints ═══
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 login/signup attempts per 15 min
  message: { error: 'Too many auth attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/google', authLimiter);

// Routes
app.use('/api/drops', dropsRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root
app.get('/', (req, res) => {
  res.json({ name: 'Dropamyn API', version: '1.0.0' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Dropamyn API running on port ${PORT}`);
});
