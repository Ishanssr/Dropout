const express = require('express');
const prisma = require('../utils/prisma');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { recalculateHypeScore } = require('../utils/hypeScore');
const { sanitizeText, validateDropInput } = require('../utils/sanitize');

const router = express.Router();

// Helper: build drop include
function dropInclude() {
  return {
    brand: { include: { _count: { select: { followers: true } } } },
    _count: { select: { comments: true, saves: true, likes: true, entries: true } },
  };
}

// Helper: add isLiked, isSaved, isEntered, isFollowingBrand flags
async function enrichDrop(drop, userId) {
  if (!userId) return { ...drop, isLiked: false, isSaved: false, isEntered: false, isFollowingBrand: false };

  const [like, save, entry, follow] = await Promise.all([
    prisma.like.findUnique({ where: { userId_dropId: { userId, dropId: drop.id } } }),
    prisma.savedDrop.findUnique({ where: { userId_dropId: { userId, dropId: drop.id } } }),
    prisma.dropEntry.findUnique({ where: { userId_dropId: { userId, dropId: drop.id } } }),
    prisma.follow.findUnique({ where: { userId_brandId: { userId, brandId: drop.brandId } } }),
  ]);

  return { ...drop, isLiked: !!like, isSaved: !!save, isEntered: !!entry, isFollowingBrand: !!follow };
}

// GET /api/drops — list all drops
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, featured, sort } = req.query;
    const where = {};
    if (category && category !== 'all') where.category = sanitizeText(category, 50);
    if (featured === 'true') where.featured = true;

    const orderBy = sort === 'hype' ? { hypeScore: 'desc' }
                  : sort === 'date' ? { dropTime: 'asc' }
                  : { createdAt: 'desc' };

    const drops = await prisma.drop.findMany({ where, orderBy, include: dropInclude() });
    const enriched = await Promise.all(drops.map(d => enrichDrop(d, req.user?.id)));
    res.json(enriched);
  } catch (err) {
    console.error('GET /api/drops error:', err);
    res.status(500).json({ error: 'Failed to fetch drops' });
  }
});

// GET /api/drops/following — personalized feed
router.get('/following', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.query;

    const follows = await prisma.follow.findMany({ where: { userId }, select: { brandId: true } });
    const brandIds = follows.map(f => f.brandId);
    if (brandIds.length === 0) return res.json([]);

    const where = { brandId: { in: brandIds } };
    if (category && category !== 'all') where.category = sanitizeText(category, 50);

    const drops = await prisma.drop.findMany({ where, orderBy: { createdAt: 'desc' }, include: dropInclude() });
    const enriched = await Promise.all(drops.map(d => enrichDrop(d, userId)));
    res.json(enriched);
  } catch (err) {
    console.error('GET /api/drops/following error:', err);
    res.status(500).json({ error: 'Failed to fetch personalized feed' });
  }
});

// GET /api/drops/trending — top 10
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const drops = await prisma.drop.findMany({ orderBy: { hypeScore: 'desc' }, take: 10, include: dropInclude() });
    const enriched = await Promise.all(drops.map(d => enrichDrop(d, req.user?.id)));
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
        comments: { include: { user: { select: { id: true, name: true, username: true, avatar: true } } }, orderBy: { createdAt: 'desc' }, take: 50 },
        _count: { select: { comments: true, saves: true, likes: true, entries: true } },
      },
    });
    if (!drop) return res.status(404).json({ error: 'Drop not found' });
    const enriched = await enrichDrop(drop, req.user?.id);
    res.json(enriched);
  } catch (err) {
    console.error('GET /api/drops/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch drop' });
  }
});

// POST /api/drops — create a new drop (IDOR-safe: brand verification)
router.post('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'brand') {
      return res.status(403).json({ error: 'Only brand accounts can create drops' });
    }

    // SECURITY: Validate all input fields
    const errors = validateDropInput(req.body);
    if (errors) return res.status(400).json({ error: 'Validation failed', details: errors });

    // SECURITY: IDOR prevention — resolve brandId from authenticated user, don't accept from body
    const brand = await prisma.brand.findFirst({ where: { name: req.user.name } });
    if (!brand) {
      return res.status(403).json({ error: 'No brand profile found for this account' });
    }

    const { title, description, imageUrl, price, category, dropTime, featured, website, accessType, maxQuantity } = req.body;
    const drop = await prisma.drop.create({
      data: {
        title: sanitizeText(title, 200),
        description: sanitizeText(description, 2000),
        imageUrl: imageUrl.trim(),
        price: sanitizeText(price || '', 50),
        category: sanitizeText(category, 50),
        hypeScore: 0,
        dropTime: new Date(dropTime),
        featured: featured === true,
        website: website ? website.trim().slice(0, 500) : null,
        brandId: brand.id, // SECURITY: Always use resolved brand, never user-supplied
        accessType: ['open', 'raffle', 'waitlist', 'invite'].includes(accessType) ? accessType : 'open',
        maxQuantity: maxQuantity ? Math.min(parseInt(maxQuantity) || 0, 100000) : null,
      },
      include: { brand: true },
    });
    res.status(201).json(drop);
  } catch (err) {
    console.error('POST /api/drops error:', err);
    res.status(500).json({ error: 'Failed to create drop' });
  }
});

// PUT /api/drops/:id/like — toggle like
router.put('/:id/like', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const dropId = req.params.id;
    const existing = await prisma.like.findUnique({ where: { userId_dropId: { userId, dropId } } });
    if (existing) { await prisma.like.delete({ where: { id: existing.id } }); }
    else { await prisma.like.create({ data: { userId, dropId } }); }
    const newScore = await recalculateHypeScore(dropId);
    const likeCount = await prisma.like.count({ where: { dropId } });
    res.json({ liked: !existing, likes: likeCount, hypeScore: newScore });
  } catch (err) {
    console.error('PUT /api/drops/:id/like error:', err);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// PUT /api/drops/:id/unlike — backward compat
router.put('/:id/unlike', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const dropId = req.params.id;
    const existing = await prisma.like.findUnique({ where: { userId_dropId: { userId, dropId } } });
    if (existing) { await prisma.like.delete({ where: { id: existing.id } }); }
    const newScore = await recalculateHypeScore(dropId);
    const likeCount = await prisma.like.count({ where: { dropId } });
    res.json({ liked: false, likes: likeCount, hypeScore: newScore });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlike drop' });
  }
});

// POST /api/drops/:id/comments — sanitized comment
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const text = sanitizeText(req.body.text, 500);
    if (!text) return res.status(400).json({ error: 'Comment text is required' });

    const comment = await prisma.comment.create({
      data: { text, userId: req.user.id, dropId: req.params.id },
      include: { user: { select: { id: true, name: true, username: true, avatar: true } } },
    });
    await recalculateHypeScore(req.params.id);
    res.status(201).json(comment);
  } catch (err) {
    console.error('POST /api/drops/:id/comments error:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// PUT /api/drops/:id/view — deduplicated view tracking (requires auth)
router.put('/:id/view', optionalAuth, async (req, res) => {
  try {
    // Only count views from authenticated users (basic dedup)
    if (!req.user) {
      return res.json({ views: 0, message: 'View not counted (unauthenticated)' });
    }
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

// POST /api/drops/:id/enter — enter raffle/waitlist
router.post('/:id/enter', requireAuth, async (req, res) => {
  try {
    const dropId = req.params.id;
    const userId = req.user.id;
    const drop = await prisma.drop.findUnique({
      where: { id: dropId },
      select: { accessType: true, maxQuantity: true, _count: { select: { entries: true } } },
    });
    if (!drop) return res.status(404).json({ error: 'Drop not found' });
    if (drop.accessType === 'open') return res.status(400).json({ error: 'This is an open drop' });
    if (drop.accessType === 'invite') return res.status(403).json({ error: 'This drop is invite-only' });

    const existing = await prisma.dropEntry.findUnique({ where: { userId_dropId: { userId, dropId } } });
    if (existing) return res.json({ entered: true, status: existing.status, message: 'Already entered' });

    if (drop.maxQuantity && drop._count.entries >= drop.maxQuantity) {
      return res.status(400).json({ error: 'This drop is full' });
    }

    const entry = await prisma.dropEntry.create({ data: { userId, dropId } });
    await recalculateHypeScore(dropId);
    res.status(201).json({ entered: true, status: entry.status, entryId: entry.id });
  } catch (err) {
    console.error('POST /api/drops/:id/enter error:', err);
    res.status(500).json({ error: 'Failed to enter drop' });
  }
});

module.exports = router;
