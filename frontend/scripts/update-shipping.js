require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.settings.upsert({
    where: { key: 'freeShippingThreshold' },
    update: { value: '999' },
    create: { key: 'freeShippingThreshold', value: '999' },
  });
  console.log('Updated freeShippingThreshold to 999');
}

main().catch(console.error).finally(() => prisma.$disconnect());
