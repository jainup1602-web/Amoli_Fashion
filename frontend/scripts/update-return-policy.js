require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check current settings
  const settings = await prisma.settings.findMany({
    where: { key: { contains: 'return' } }
  });
  console.log('Current return settings:', JSON.stringify(settings, null, 2));

  // Update returnPolicyDays to 3
  await prisma.settings.upsert({
    where: { key: 'returnPolicyDays' },
    update: { value: '3' },
    create: { key: 'returnPolicyDays', value: '3' },
  });
  console.log('Updated returnPolicyDays to 3');
}

main().catch(console.error).finally(() => prisma.$disconnect());
