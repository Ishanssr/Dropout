const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/brands — list all brands
router.get('/', optionalAuth, async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      include: { _count: { select: { drops: true, followers: true } } },
      orderBy: { name: 'asc' },
    });

    // Add isFollowing flag if user is logged in
    if (req.user) {
      const follows = await prisma.follow.findMany({
        where: { userId: req.user.id },
        select: { brandId: true },
      });
      const followedIds = new Set(follows.map(f => f.brandId));
      const enriched = brands.map(b => ({ ...b, isFollowing: followedIds.has(b.id) }));
      return res.json(enriched);
    }

    res.json(brands.map(b => ({ ...b, isFollowing: false })));
  } catch (err) {
    console.error('GET /api/brands error:', err);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// GET /api/brands/:id — single brand with its drops
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: req.params.id },
      include: {
        drops: {
          orderBy: { dropTime: 'asc' },
          include: { _count: { select: { comments: true, likes: true, saves: true, entries: true } } },
        },
        _count: { select: { followers: true, drops: true } },
      },
    });
    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    let isFollowing = false;
    if (req.user) {
      const follow = await prisma.follow.findUnique({
        where: { userId_brandId: { userId: req.user.id, brandId: brand.id } },
      });
      isFollowing = !!follow;
    }

    res.json({ ...brand, isFollowing });
  } catch (err) {
    console.error('GET /api/brands/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// POST /api/brands — find or create brand (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, logo, website } = req.body;
    let brand = await prisma.brand.findUnique({ where: { name } });
    if (!brand) {
      brand = await prisma.brand.create({ data: { name, logo, website } });
    }
    res.status(201).json(brand);
  } catch (err) {
    console.error('POST /api/brands error:', err);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

// PUT /api/brands/:id/follow — toggle follow (auth required)
router.put('/:id/follow', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const brandId = req.params.id;

    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    const existing = await prisma.follow.findUnique({
      where: { userId_brandId: { userId, brandId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
    } else {
      await prisma.follow.create({ data: { userId, brandId } });
    }

    const followerCount = await prisma.follow.count({ where: { brandId } });

    res.json({ following: !existing, followers: followerCount });
  } catch (err) {
    console.error('PUT /api/brands/:id/follow error:', err);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

// GET /api/brands/:id/analytics — brand analytics (auth required, brand only)
router.get('/:id/analytics', requireAuth, async (req, res) => {
  try {
    // Get all drops for this brand
    const drops = await prisma.drop.findMany({
      where: { brandId: req.params.id },
      include: {
        _count: { select: { likes: true, comments: true, saves: true, entries: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate totals
    const totals = drops.reduce(
      (acc, drop) => ({
        totalViews: acc.totalViews + drop.views,
        totalLikes: acc.totalLikes + drop._count.likes,
        totalComments: acc.totalComments + drop._count.comments,
        totalSaves: acc.totalSaves + drop._count.saves,
        totalEntries: acc.totalEntries + drop._count.entries,
      }),
      { totalViews: 0, totalLikes: 0, totalComments: 0, totalSaves: 0, totalEntries: 0 }
    );

    const followerCount = await prisma.follow.count({ where: { brandId: req.params.id } });

    // Per-drop breakdown
    const dropStats = drops.map(d => ({
      id: d.id,
      title: d.title,
      imageUrl: d.imageUrl,
      category: d.category,
      hypeScore: d.hypeScore,
      accessType: d.accessType,
      dropTime: d.dropTime,
      views: d.views,
      likes: d._count.likes,
      comments: d._count.comments,
      saves: d._count.saves,
      entries: d._count.entries,
    }));

    res.json({
      brandId: req.params.id,
      followers: followerCount,
      totalDrops: drops.length,
      ...totals,
      drops: dropStats,
    });
  } catch (err) {
    console.error('GET /api/brands/:id/analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
