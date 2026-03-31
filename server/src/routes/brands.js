const express = require('express');
const prisma = require('../utils/prisma');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { sanitizeText } = require('../utils/sanitize');

const router = express.Router();

// GET /api/brands — list all brands
router.get('/', optionalAuth, async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      include: { _count: { select: { drops: true, followers: true } } },
      orderBy: { name: 'asc' },
    });

    if (req.user) {
      const follows = await prisma.follow.findMany({ where: { userId: req.user.id }, select: { brandId: true } });
      const followedIds = new Set(follows.map(f => f.brandId));
      return res.json(brands.map(b => ({ ...b, isFollowing: followedIds.has(b.id) })));
    }

    res.json(brands.map(b => ({ ...b, isFollowing: false })));
  } catch (err) {
    console.error('GET /api/brands error:', err);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// GET /api/brands/:id — single brand with drops
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: req.params.id },
      include: {
        drops: { orderBy: { dropTime: 'asc' }, include: { _count: { select: { comments: true, likes: true, saves: true, entries: true } } } },
        _count: { select: { followers: true, drops: true } },
      },
    });
    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    let isFollowing = false;
    let isOwner = false;
    if (req.user) {
      const follow = await prisma.follow.findUnique({ where: { userId_brandId: { userId: req.user.id, brandId: brand.id } } });
      isFollowing = !!follow;
      // Check if the logged-in user is the brand owner
      if (req.user.role === 'brand' && req.user.name === brand.name) {
        isOwner = true;
      }
    }
    res.json({ ...brand, isFollowing, isOwner });
  } catch (err) {
    console.error('GET /api/brands/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// POST /api/brands — create brand (auth required, brand role only)
router.post('/', requireAuth, async (req, res) => {
  try {
    // SECURITY: Only brand accounts can create brands
    if (req.user.role !== 'brand') {
      return res.status(403).json({ error: 'Only brand accounts can create brands' });
    }

    const { name, logo, website } = req.body;
    const safeName = sanitizeText(name, 100);
    if (!safeName) return res.status(400).json({ error: 'Brand name is required' });

    let brand = await prisma.brand.findUnique({ where: { name: safeName } });
    if (!brand) {
      brand = await prisma.brand.create({ data: { name: safeName, logo: logo || '', website: website || null } });
    }
    res.status(201).json(brand);
  } catch (err) {
    console.error('POST /api/brands error:', err);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

// PUT /api/brands/:id/follow — toggle follow
router.put('/:id/follow', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const brandId = req.params.id;

    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    const existing = await prisma.follow.findUnique({ where: { userId_brandId: { userId, brandId } } });
    if (existing) { await prisma.follow.delete({ where: { id: existing.id } }); }
    else { await prisma.follow.create({ data: { userId, brandId } }); }

    const followerCount = await prisma.follow.count({ where: { brandId } });
    res.json({ following: !existing, followers: followerCount });
  } catch (err) {
    console.error('PUT /api/brands/:id/follow error:', err);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

// GET /api/brands/:id/analytics — SECURITY: brand owner only
router.get('/:id/analytics', requireAuth, async (req, res) => {
  try {
    // SECURITY: Verify the authenticated user owns this brand
    if (req.user.role !== 'brand') {
      return res.status(403).json({ error: 'Only brand accounts can view analytics' });
    }
    const userBrand = await prisma.brand.findFirst({ where: { name: req.user.name } });
    if (!userBrand || userBrand.id !== req.params.id) {
      return res.status(403).json({ error: 'You can only view your own brand analytics' });
    }

    const drops = await prisma.drop.findMany({
      where: { brandId: req.params.id },
      include: { _count: { select: { likes: true, comments: true, saves: true, entries: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const totals = drops.reduce((acc, d) => ({
      totalViews: acc.totalViews + d.views,
      totalLikes: acc.totalLikes + d._count.likes,
      totalComments: acc.totalComments + d._count.comments,
      totalSaves: acc.totalSaves + d._count.saves,
      totalEntries: acc.totalEntries + d._count.entries,
    }), { totalViews: 0, totalLikes: 0, totalComments: 0, totalSaves: 0, totalEntries: 0 });

    const followerCount = await prisma.follow.count({ where: { brandId: req.params.id } });

    res.json({
      brandId: req.params.id,
      followers: followerCount,
      totalDrops: drops.length,
      ...totals,
      drops: drops.map(d => ({
        id: d.id, title: d.title, imageUrl: d.imageUrl, category: d.category,
        hypeScore: d.hypeScore, accessType: d.accessType, dropTime: d.dropTime,
        views: d.views, likes: d._count.likes, comments: d._count.comments,
        saves: d._count.saves, entries: d._count.entries,
      })),
    });
  } catch (err) {
    console.error('GET /api/brands/:id/analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
