const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateEmail() {
  try {
    const setting = await prisma.settings.findFirst({
      where: { key: 'contactEmail' }
    });
    
    if (setting) {
      console.log('Current value:', setting.value);
      
      const result = await prisma.settings.updateMany({
        where: { key: 'contactEmail' },
        data: { value: 'support@amolijewelry.com' }
      });
      console.log('Email updated:', result, 'New value:', 'support@amolijewelry.com');
    } else {
      console.log('Email setting not found, creating it...');
      await prisma.settings.create({
        data: {
          key: 'contactEmail',
          value: 'support@amolijewelry.com'
        }
      });
      console.log('Created setting with support@amolijewelry.com');
    }
  } catch (error) {
    console.error('Error updating email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEmail();
