const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.banner.deleteMany({});
  console.log(`Deleted ${deleted.count} banners`);
  console.log('Now re-upload banners from admin panel with fresh images');
}

main().catch(console.error).finally(() => prisma.$disconnect());
