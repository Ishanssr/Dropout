const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { JWT_SECRET } = require('../middleware/auth');
const { sanitizeText, isValidEmail, validatePassword } = require('../utils/sanitize');

const router = express.Router();

function buildUsername(name, email) {
  const namePart = (name || email || 'dropout-user')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 18);
  return namePart || 'dropoutuser';
}

function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d', issuer: 'dropamyn', audience: 'dropamyn-api' }
  );
}

function safeUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    username: user.username,
    website: user.website,
    instagramHandle: user.instagramHandle,
    location: user.location,
  };
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, name, password, role, brandCategory } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }

    // Validate email
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    const pwError = validatePassword(password);
    if (pwError) {
      return res.status(400).json({ error: pwError });
    }

    // Sanitize name
    const safeName = sanitizeText(name, 50);
    if (!safeName) return res.status(400).json({ error: 'Invalid name' });

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password (cost factor 12 for stronger hashing)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userRole = role === 'brand' ? 'brand' : 'user';
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: safeName,
        password: hashedPassword,
        role: userRole,
        username: buildUsername(safeName, email),
      },
    });

    // If brand, auto-create a Brand record
    if (userRole === 'brand') {
      try {
        const safeCategory = brandCategory ? sanitizeText(brandCategory, 50) : null;
        await prisma.brand.create({
          data: { name: safeName, logo: '', category: safeCategory },
        });
      } catch (brandErr) {
        // Brand may already exist with this name
      }
    }

    const token = signToken(user);
    res.status(201).json({ token, user: safeUserResponse(user) });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'This account uses Google Sign-In. Please use the Google button.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.json({ token, user: safeUserResponse(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// POST /api/auth/google — Google Sign-In
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify token with Google
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!googleRes.ok) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }
    const payload = await googleRes.json();

    const { sub: googleId, email, name, picture } = payload;
    if (!email) {
      return res.status(400).json({ error: 'Google account has no email' });
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatar: user.avatar || picture },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name: sanitizeText(name || email.split('@')[0], 50),
          googleId,
          avatar: picture || null,
          username: buildUsername(name, email),
          role: 'user',
        },
      });
    }

    const token = signToken(user);
    res.json({ token, user: safeUserResponse(user) });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google sign-in failed' });
  }
});

// GET /api/auth/me — get current user from token
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'dropamyn',
      audience: 'dropamyn-api',
    });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true, email: true, name: true, role: true, avatar: true, bio: true,
        username: true, website: true, instagramHandle: true, location: true, createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
