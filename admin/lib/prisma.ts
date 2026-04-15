import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Enhanced connection management
let isConnected = false;

export async function ensureConnection() {
  if (!isConnected) {
    try {
      await prisma.$connect();
      isConnected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      isConnected = false;
      throw error;
    }
  }
  return prisma;
}

// Handle connection errors and retry
export async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await ensureConnection();
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Database operation failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      // If it's a connection error, reset connection state and try to reconnect
      if (error.code === 'P1017' || error.message.includes('connection')) {
        isConnected = false;
        try {
          await prisma.$disconnect();
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        } catch (disconnectError) {
          console.error('Error during disconnect:', disconnectError);
        }
      } else {
        // If it's not a connection error, don't retry
        break;
      }
    }
  }
  
  throw lastError;
}

export default prisma;
