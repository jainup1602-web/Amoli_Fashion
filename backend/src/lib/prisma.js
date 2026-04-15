const { PrismaClient } = require('@prisma/client');

// Build DATABASE_URL from individual parts if not provided directly
function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'root';
  const name = process.env.DB_NAME || 'amoli_jewelry';

  return `mysql://${user}:${password}@${host}:${port}/${name}`;
}

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: { url: getDatabaseUrl() },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = prisma;
