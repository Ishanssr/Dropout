require('dotenv').config();
const express = require('express');
const cors = require('cors');

const dropsRouter = require('./routes/drops');
const brandsRouter = require('./routes/brands');
const usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ═══ SECURITY: Manual security headers (replaces helmet) ═══
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.removeHeader('X-Powered-By');
  next();
});

// ═══ SECURITY: CORS ═══
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
app.use(express.json({ limit: '1mb' }));

// ═══ SECURITY: In-memory rate limiter (replaces express-rate-limit) ═══
const rateLimitStore = new Map();

function createRateLimiter(windowMs, max, message) {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    let entry = rateLimitStore.get(key);

    if (!entry || now - entry.start > windowMs) {
      entry = { start: now, count: 1 };
      rateLimitStore.set(key, entry);
    } else {
      entry.count++;
    }

    if (entry.count > max) {
      return res.status(429).json({ error: message });
    }
    next();
  };
}

// Clean up rate limit store every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now - entry.start > 15 * 60 * 1000) rateLimitStore.delete(key);
  }
}, 5 * 60 * 1000);

// Global: 100 req/min
app.use(createRateLimiter(60 * 1000, 100, 'Too many requests, please try again later'));

// Auth: 15 req/15min
const authLimiter = createRateLimiter(15 * 60 * 1000, 15, 'Too many auth attempts. Please try again in 15 minutes.');
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
