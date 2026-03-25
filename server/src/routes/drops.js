const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { recalculateHypeScore } = require('../utils/hypeScore');

const router = express.Router();
const prisma = new PrismaClient();

// Helper: build drop include with optional user context for isLiked/isSaved
function dropInclude(userId) {
  const include = {
    brand: { include: { _count: { select: { followers: true } } } },
    _count: { select: { comments: true, saves: true, likes: true, entries: true } },
  };
  return include;
}

// Helper: add isLiked, isSaved, isEntered flags
async function enrichDrop(drop, userId) {
  if (!userId) return { ...drop, isLiked: false, isSaved: false, isEntered: false };

  const [like, save, entry] = await Promise.all([
    prisma.like.findUnique({ where: { userId_dropId: { userId, dropId: drop.id } } }),
    prisma.savedDrop.findUnique({ where: { userId_dropId: { userId, dropId: drop.id } } }),
    prisma.dropEntry.findUnique({ where: { userId_dropId: { userId, dropId: drop.id } } }),
  ]);

  return { ...drop, isLiked: !!like, isSaved: !!save, isEntered: !!entry };
}

// GET /api/drops — list all drops (with filters)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, featured, sort } = req.query;
    const where = {};
    if (category && category !== 'all') where.category = category;
    if (featured === 'true') where.featured = true;

    const orderBy = sort === 'hype' ? { hypeScore: 'desc' }
                  : sort === 'date' ? { dropTime: 'asc' }
                  : { createdAt: 'desc' };

    const drops = await prisma.drop.findMany({
      where,
      orderBy,
      include: dropInclude(),
    });

    const userId = req.user?.id;
    const enriched = await Promise.all(drops.map(d => enrichDrop(d, userId)));
    res.json(enriched);
  } catch (err) {
    console.error('GET /api/drops error:', err);
    res.status(500).json({ error: 'Failed to fetch drops' });
  }
});

// GET /api/drops/trending — top 10 by hypeScore
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const drops = await prisma.drop.findMany({
      orderBy: { hypeScore: 'desc' },
      take: 10,
      include: dropInclude(),
    });

    const userId = req.user?.id;
    const enriched = await Promise.all(drops.map(d => enrichDrop(d, userId)));
    res.json(enriched);
  } catch (err) {
    console.error('GET /api/drops/trending error:', err);
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

// GET /api/drops/:id — single drop
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const drop = await prisma.drop.findUnique({
      where: { id: req.params.id },
      include: {
        brand: { include: { _count: { select: { followers: true } } } },
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: { select: { comments: true, saves: true, likes: true, entries: true } },
      },
    });
    if (!drop) return res.status(404).json({ error: 'Drop not found' });

    const enriched = await enrichDrop(drop, req.user?.id);

    // Also check if user follows this brand
    if (req.user) {
      const follow = await prisma.follow.findUnique({
        where: { userId_brandId: { userId: req.user.id, brandId: drop.brandId } },
      });
      enriched.isFollowingBrand = !!follow;
    } else {
      enriched.isFollowingBrand = false;
    }

    res.json(enriched);
  } catch (err) {
    console.error('GET /api/drops/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch drop', detail: err.message });
  }
});

// POST /api/drops — create a new drop (brand auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'brand') {
      return res.status(403).json({ error: 'Only brand accounts can create drops' });
    }

    const { title, description, imageUrl, price, category, dropTime, featured, website, brandId, accessType, maxQuantity } = req.body;
    const drop = await prisma.drop.create({
      data: {
        title,
        description,
        imageUrl,
        price,
        category,
        hypeScore: 0,
        dropTime: new Date(dropTime),
        featured: featured || false,
        website,
        brandId,
        accessType: accessType || 'open',
        maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
      },
      include: { brand: true },
    });
    res.status(201).json(drop);
  } catch (err) {
    console.error('POST /api/drops error:', err);
    res.status(500).json({ error: 'Failed to create drop' });
  }
});

// PUT /api/drops/:id/like — toggle like (auth required)
router.put('/:id/like', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const dropId = req.params.id;

    const existing = await prisma.like.findUnique({
      where: { userId_dropId: { userId, dropId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({ data: { userId, dropId } });
    }

    const newScore = await recalculateHypeScore(dropId);
    const likeCount = await prisma.like.count({ where: { dropId } });

    res.json({ liked: !existing, likes: likeCount, hypeScore: newScore });
  } catch (err) {
    console.error('PUT /api/drops/:id/like error:', err);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// PUT /api/drops/:id/unlike — kept for backward compat, redirects to toggle
router.put('/:id/unlike', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const dropId = req.params.id;

    const existing = await prisma.like.findUnique({
      where: { userId_dropId: { userId, dropId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    }

    const newScore = await recalculateHypeScore(dropId);
    const likeCount = await prisma.like.count({ where: { dropId } });

    res.json({ liked: false, likes: likeCount, hypeScore: newScore });
  } catch (err) {
    console.error('PUT /api/drops/:id/unlike error:', err);
    res.status(500).json({ error: 'Failed to unlike drop' });
  }
});

// POST /api/drops/:id/comments — add comment (auth required)
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await prisma.comment.create({
      data: { text, userId: req.user.id, dropId: req.params.id },
      include: { user: true },
    });

    await recalculateHypeScore(req.params.id);
    res.status(201).json(comment);
  } catch (err) {
    console.error('POST /api/drops/:id/comments error:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});


// PUT /api/drops/:id/view — increment views
router.put('/:id/view', async (req, res) => {
  try {
    const drop = await prisma.drop.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });

    await recalculateHypeScore(req.params.id);
    res.json({ views: drop.views });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// POST /api/drops/:id/enter — enter raffle/waitlist (auth required)
router.post('/:id/enter', requireAuth, async (req, res) => {
  try {
    const dropId = req.params.id;
    const userId = req.user.id;

    const drop = await prisma.drop.findUnique({
      where: { id: dropId },
      select: { accessType: true, maxQuantity: true, _count: { select: { entries: true } } },
    });

    if (!drop) return res.status(404).json({ error: 'Drop not found' });

    if (drop.accessType === 'open') {
      return res.status(400).json({ error: 'This is an open drop — no entry needed' });
    }

    if (drop.accessType === 'invite') {
      return res.status(403).json({ error: 'This drop is invite-only' });
    }

    // Check if already entered
    const existing = await prisma.dropEntry.findUnique({
      where: { userId_dropId: { userId, dropId } },
    });
    if (existing) {
      return res.json({ entered: true, status: existing.status, message: 'Already entered' });
    }

    // Check capacity for waitlist
    if (drop.maxQuantity && drop._count.entries >= drop.maxQuantity) {
      return res.status(400).json({ error: 'This drop is full' });
    }

    const entry = await prisma.dropEntry.create({
      data: { userId, dropId },
    });

    await recalculateHypeScore(dropId);

    res.status(201).json({ entered: true, status: entry.status, entryId: entry.id });
  } catch (err) {
    console.error('POST /api/drops/:id/enter error:', err);
    res.status(500).json({ error: 'Failed to enter drop' });
  }
});

module.exports = router;
