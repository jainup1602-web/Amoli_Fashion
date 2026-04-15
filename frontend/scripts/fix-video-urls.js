require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all video reviews with w3schools demo URL
  const reviews = await prisma.videoreview.findMany({
    where: { videoUrl: { contains: 'w3schools' } },
    select: { id: true, videoUrl: true, customerName: true }
  });
  
  console.log('Found w3schools videos:', reviews.length);
  console.log(JSON.stringify(reviews, null, 2));

  if (reviews.length > 0) {
    // Delete them or update with empty URL
    await prisma.videoreview.deleteMany({
      where: { videoUrl: { contains: 'w3schools' } }
    });
    console.log('Deleted', reviews.length, 'demo video reviews');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
