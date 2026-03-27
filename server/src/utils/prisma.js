const { PrismaClient } = require('@prisma/client');

// Singleton — prevents multiple connection pools across route files
const prisma = global.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__prisma = prisma;

module.exports = prisma;
