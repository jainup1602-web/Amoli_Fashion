const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const banners = await prisma.banner.findMany({
    select: { id: true, title: true, isActive: true, image: true }
  });
  
  if (banners.length === 0) {
    console.log('No banners found in DB');
    return;
  }
  
  banners.forEach(b => {
    const img = b.image || '';
    const imgType = img.startsWith('data:') ? 'base64' : img.startsWith('http') ? 'URL' : img ? 'other' : 'EMPTY';
    const imgPreview = img.substring(0, 80);
    console.log(`ID: ${b.id} | Active: ${b.isActive} | Title: ${b.title}`);
    console.log(`  Image type: ${imgType} | Preview: ${imgPreview}`);
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
