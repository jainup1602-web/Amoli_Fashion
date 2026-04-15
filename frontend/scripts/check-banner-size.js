const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const banners = await prisma.banner.findMany({
    select: { id: true, title: true, image: true }
  });
  
  banners.forEach(b => {
    const sizeKB = Buffer.byteLength(b.image || '', 'utf8') / 1024;
    const sizeMB = sizeKB / 1024;
    console.log(`Title: ${b.title}`);
    console.log(`  Image size: ${sizeKB.toFixed(1)} KB (${sizeMB.toFixed(2)} MB)`);
    console.log(`  Starts with: ${b.image?.substring(0, 30)}`);
    console.log('');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
