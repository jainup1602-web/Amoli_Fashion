const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAddress() {
  try {
    const setting = await prisma.settings.findFirst({
      where: { key: 'address' }
    });
    
    if (setting) {
      console.log('Current value:', setting.value);
      
      let newValue = setting.value.replace('121, Prem-Suraj, ', '');
      newValue = newValue.replace('121, Prem-Suraj,', '');
      
      const result = await prisma.settings.updateMany({
        where: { key: 'address' },
        data: { value: newValue }
      });
      console.log('Address updated:', result, 'New value:', newValue);
    } else {
      console.log('Address setting not found');
    }
  } catch (error) {
    console.error('Error updating address:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAddress();
