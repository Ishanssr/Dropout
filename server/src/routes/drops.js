const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/drops — list all drops (with filters)
router.get('/', async (req, res) => {
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
      include: { brand: true, _count: { select: { comments: true, saves: true } } },
    });

    res.json(drops);
  } catch (err) {
    console.error('GET /api/drops error:', err);
    res.status(500).json({ error: 'Failed to fetch drops' });
  }
});

// GET /api/drops/trending — top 10 by hypeScore
router.get('/trending', async (req, res) => {
  try {
    const drops = await prisma.drop.findMany({
      orderBy: { hypeScore: 'desc' },
      take: 10,
      include: { brand: true, _count: { select: { comments: true, saves: true } } },
    });
    res.json(drops);
  } catch (err) {
    console.error('GET /api/drops/trending error:', err);
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

// GET /api/drops/:id — single drop
router.get('/:id', async (req, res) => {
  try {
    const drop = await prisma.drop.findUnique({
      where: { id: req.params.id },
      include: {
        brand: true,
        comments: { include: { user: true }, orderBy: { createdAt: 'desc' }, take: 50 },
        _count: { select: { comments: true, saves: true } },
      },
    });
    if (!drop) return res.status(404).json({ error: 'Drop not found' });
    res.json(drop);
  } catch (err) {
    console.error('GET /api/drops/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch drop' });
  }
});

// POST /api/drops — create a new drop
router.post('/', async (req, res) => {
  try {
    const { title, description, imageUrl, price, category, hypeScore, dropTime, featured, website, brandId } = req.body;
    const drop = await prisma.drop.create({
      data: { title, description, imageUrl, price, category, hypeScore: hypeScore || 0, dropTime: new Date(dropTime), featured: featured || false, website, brandId },
      include: { brand: true },
    });
    res.status(201).json(drop);
  } catch (err) {
    console.error('POST /api/drops error:', err);
    res.status(500).json({ error: 'Failed to create drop' });
  }
});

// PUT /api/drops/:id/like — increment likes
router.put('/:id/like', async (req, res) => {
  try {
    const drop = await prisma.drop.update({
      where: { id: req.params.id },
      data: { likes: { increment: 1 } },
    });
    res.json({ likes: drop.likes });
  } catch (err) {
    console.error('PUT /api/drops/:id/like error:', err);
    res.status(500).json({ error: 'Failed to like drop' });
  }
});

// PUT /api/drops/:id/unlike — decrement likes
router.put('/:id/unlike', async (req, res) => {
  try {
    const drop = await prisma.drop.update({
      where: { id: req.params.id },
      data: { likes: { decrement: 1 } },
    });
    res.json({ likes: drop.likes });
  } catch (err) {
    console.error('PUT /api/drops/:id/unlike error:', err);
    res.status(500).json({ error: 'Failed to unlike drop' });
  }
});

// POST /api/drops/:id/comments — add comment
router.post('/:id/comments', async (req, res) => {
  try {
    const { text, userId } = req.body;
    const comment = await prisma.comment.create({
      data: { text, userId, dropId: req.params.id },
      include: { user: true },
    });
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
    res.json({ views: drop.views });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track view' });
  }
});

module.exports = router;
