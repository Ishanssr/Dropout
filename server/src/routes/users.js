const express = require('express');
const prisma = require('../utils/prisma');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { recalculateHypeScore } = require('../utils/hypeScore');
const { sanitizeText, sanitizeUsername, isValidUrl } = require('../utils/sanitize');

const router = express.Router();

// SECURITY: Whitelist of fields a user can update on their own profile
const ALLOWED_UPDATE_FIELDS = ['name', 'bio', 'avatar', 'username', 'website', 'instagramHandle', 'location'];

// GET /api/users/search?q=... — search users
router.get('/search', async (req, res) => {
  try {
    const q = sanitizeText(req.query.q, 100);
    if (!q || q.length < 1) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true, name: true, username: true, avatar: true, bio: true, role: true,
        _count: { select: { likes: true, follows: true } },
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    const enriched = await Promise.all(users.map(async (u) => {
      if (u.role === 'brand') {
        const brand = await prisma.brand.findFirst({ where: { name: u.name }, select: { id: true } });
        return { ...u, brandId: brand?.id || null };
      }
      return u;
    }));

    res.json(enriched);
  } catch (err) {
    console.error('GET /api/users/search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/users/:id — get user profile (email only visible to self)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const isSelf = req.user?.id === req.params.id;
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: isSelf, // SECURITY: Only include email if viewing own profile
        name: true, role: true, avatar: true, bio: true,
        username: true, website: true, instagramHandle: true, location: true,
        createdAt: true,
        follows: { include: { brand: { select: { id: true, name: true, logo: true } } }, orderBy: { createdAt: 'desc' } },
        _count: { select: { comments: true, savedDrops: true, likes: true, follows: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('GET /api/users/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/users/:id — update profile (auth + ownership required)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    // SECURITY: Users can only update their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    // SECURITY: Strict whitelist — only allow known safe fields
    const data = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        const val = req.body[field];
        if (field === 'name') data.name = sanitizeText(val, 50);
        else if (field === 'bio') data.bio = sanitizeText(val, 150);
        else if (field === 'username') data.username = sanitizeUsername(val);
        else if (field === 'website') {
          if (val && !isValidUrl(val)) continue; // skip invalid
          data.website = val ? val.trim().slice(0, 200) : '';
        }
        else if (field === 'instagramHandle') data.instagramHandle = sanitizeText(val, 30).replace(/^@+/, '');
        else if (field === 'location') data.location = sanitizeText(val, 100);
        else if (field === 'avatar') {
          // Only allow Cloudinary URLs for avatars
          if (typeof val === 'string' && (val.includes('cloudinary.com') || val.includes('res.cloudinary') || val === '')) {
            data.avatar = val;
          }
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true, email: true, name: true, role: true, avatar: true, bio: true,
        username: true, website: true, instagramHandle: true, location: true,
        createdAt: true,
        _count: { select: { comments: true, savedDrops: true, likes: true, follows: true } },
      },
    });
    res.json(user);
  } catch (err) {
    console.error('PUT /api/users/:id error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/users/:userId/save/:dropId — toggle save
router.put('/:userId/save/:dropId', requireAuth, async (req, res) => {
  try {
    const { userId, dropId } = req.params;
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'You can only save drops for yourself' });
    }

    const existing = await prisma.savedDrop.findUnique({ where: { userId_dropId: { userId, dropId } } });
    if (existing) {
      await prisma.savedDrop.delete({ where: { id: existing.id } });
      await recalculateHypeScore(dropId);
      res.json({ saved: false });
    } else {
      await prisma.savedDrop.create({ data: { userId, dropId } });
      await recalculateHypeScore(dropId);
      res.json({ saved: true });
    }
  } catch (err) {
    console.error('PUT /api/users/:userId/save/:dropId error:', err);
    res.status(500).json({ error: 'Failed to toggle save' });
  }
});

// GET /api/users/:id/saved — get saved drops
router.get('/:id/saved', async (req, res) => {
  try {
    const saves = await prisma.savedDrop.findMany({
      where: { userId: req.params.id },
      include: {
        drop: {
          include: {
            brand: true,
            _count: { select: { likes: true, comments: true, saves: true, entries: true } },
          },
        },
      },
      orderBy: { id: 'desc' },
    });
    res.json(saves.map(s => s.drop));
  } catch (err) {
    console.error('GET /api/users/:id/saved error:', err);
    res.status(500).json({ error: 'Failed to fetch saved drops' });
  }
});

module.exports = router;
