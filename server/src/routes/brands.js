const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/brands — list all brands
router.get('/', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      include: { _count: { select: { drops: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(brands);
  } catch (err) {
    console.error('GET /api/brands error:', err);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// GET /api/brands/:id — single brand with its drops
router.get('/:id', async (req, res) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: req.params.id },
      include: {
        drops: { orderBy: { dropTime: 'asc' }, include: { _count: { select: { comments: true } } } },
      },
    });
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    console.error('GET /api/brands/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// POST /api/brands — create brand
router.post('/', async (req, res) => {
  try {
    const { name, logo, website } = req.body;
    const brand = await prisma.brand.create({ data: { name, logo, website } });
    res.status(201).json(brand);
  } catch (err) {
    console.error('POST /api/brands error:', err);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

module.exports = router;
