const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { recalculateHypeScore } = require('../utils/hypeScore');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/search?q=... — search users by username or name
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q.trim(), mode: 'insensitive' } },
          { name: { contains: q.trim(), mode: 'insensitive' } },
        ],
      },
      select: {
        id: true, name: true, username: true, avatar: true, bio: true, role: true,
        _count: { select: { likes: true, follows: true } },
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    // For brand users, find their associated brand
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

// GET /api/users/:id — get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, name: true, role: true, avatar: true, bio: true,
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

// PUT /api/users/:id — update user profile (auth required)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    // Users can only update their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const { name, bio, avatar, username, website, instagramHandle, location } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (bio !== undefined) data.bio = bio;
    if (avatar !== undefined) data.avatar = avatar;
    if (username !== undefined) data.username = username;
    if (website !== undefined) data.website = website;
    if (instagramHandle !== undefined) data.instagramHandle = instagramHandle;
    if (location !== undefined) data.location = location;

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

// PUT /api/users/:userId/save/:dropId — toggle save (auth required)
router.put('/:userId/save/:dropId', requireAuth, async (req, res) => {
  try {
    const { userId, dropId } = req.params;

    // Users can only save for themselves
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'You can only save drops for yourself' });
    }

    const existing = await prisma.savedDrop.findUnique({
      where: { userId_dropId: { userId, dropId } },
    });
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
