const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Available models:');
const models = Object.getOwnPropertyNames(prisma).filter(name => 
  !name.startsWith('_') && 
  !name.startsWith('$') && 
  typeof prisma[name] === 'object' &&
  prisma[name].findMany
);

console.log(models);

// Test if popup exists
if (prisma.popup) {
  console.log('✅ popup model exists');
} else {
  console.log('❌ popup model does not exist');
}

prisma.$disconnect();