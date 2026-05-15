const { PrismaClient } = require('@prisma/client');

// Build DATABASE_URL from individual parts if not provided directly
function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'root';
  const name = process.env.DB_NAME || 'amoli_jewelry';
  const ssl = process.env.DB_SSL === 'true' ? '?ssl-mode=REQUIRED' : '';

  return `mysql://${user}:${encodeURIComponent(password)}@${host}:${port}/${name}${ssl}`;
}

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: { url: getDatabaseUrl() },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Enhanced connection management
let isConnected = false;

async function ensureConnection() {
  if (!isConnected) {
    try {
      console.log('🔄 Attempting to connect to database...');
      await prisma.$connect();
      isConnected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      isConnected = false;
      throw error;
    }
  }
  return prisma;
}

/**
 * Executes a database operation with retry logic for connection errors.
 * @param {Function} operation - The database operation to execute
 * @param {number} maxRetries - Maximum number of retries
 */
async function executeWithRetry(operation, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await ensureConnection();
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`❌ Database operation failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      // If it's a connection error (like P1017), reset connection state and try to reconnect
      if (error.code === 'P1017' || error.message.includes('connection') || error.message.includes('closed')) {
        isConnected = false;
        try {
          await prisma.$disconnect();
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); 
        } catch (disconnectError) {
          console.error('Error during disconnect:', disconnectError.message);
        }
      } else {
        // If it's not a connection error, don't retry
        break;
      }
    }
  }
  
  throw lastError;
}

module.exports = prisma;
module.exports.executeWithRetry = executeWithRetry;
module.exports.ensureConnection = ensureConnection;
