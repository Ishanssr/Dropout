const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/:id — get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        savedDrops: { include: { drop: { include: { brand: true } } } },
        _count: { select: { comments: true, savedDrops: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('GET /api/users/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users — create user (signup placeholder)
router.post('/', async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    const user = await prisma.user.create({ data: { email, name, avatar } });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('POST /api/users error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:userId/save/:dropId — toggle save
router.put('/:userId/save/:dropId', async (req, res) => {
  try {
    const { userId, dropId } = req.params;
    const existing = await prisma.savedDrop.findUnique({
      where: { userId_dropId: { userId, dropId } },
    });
    if (existing) {
      await prisma.savedDrop.delete({ where: { id: existing.id } });
      res.json({ saved: false });
    } else {
      await prisma.savedDrop.create({ data: { userId, dropId } });
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
      include: { drop: { include: { brand: true } } },
      orderBy: { id: 'desc' },
    });
    res.json(saves.map(s => s.drop));
  } catch (err) {
    console.error('GET /api/users/:id/saved error:', err);
    res.status(500).json({ error: 'Failed to fetch saved drops' });
  }
});

module.exports = router;
