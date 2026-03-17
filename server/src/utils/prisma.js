/**
 * CampusFlow — Prisma Singleton
 *
 * Exports a single shared PrismaClient instance to prevent
 * connection pool exhaustion from multiple instantiations.
 * Import this everywhere instead of doing `new PrismaClient()`.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
