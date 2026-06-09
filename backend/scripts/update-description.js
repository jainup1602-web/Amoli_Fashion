const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDescription() {
  try {
    const description = "Premium Jewellery That Stays as Precious as You.\nFrom timeless traditional designs to contemporary demi-fine pieces, our collection is crafted with anti-tarnish technology and skin-friendly materials for beauty that lasts beyond trends.";
    const jsonValue = JSON.stringify(description);
    
    const setting = await prisma.settings.findFirst({
      where: { key: 'siteDescription' }
    });
    
    if (setting) {
      const result = await prisma.settings.updateMany({
        where: { key: 'siteDescription' },
        data: { value: jsonValue }
      });
      console.log('Description updated in DB:', result);
    } else {
      await prisma.settings.create({
        data: {
          key: 'siteDescription',
          value: jsonValue
        }
      });
      console.log('Description created in DB');
    }
  } catch (error) {
    console.error('Error updating description:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDescription();
