const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = {
    contactPhone: '9982470002',
    whatsappNumber: '9982470002',
    address: '121, Prem-Suraj, Pratap Colony, Beawar, Rajasthan - 305901',
    siteName: 'Amoli Fashion Jewellery',
    siteDescription: 'Premium handcrafted imitation jewellery. Anti-tarnish, hypoallergenic, and skin-friendly. Born in the heart of Rajasthan.',
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.settings.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
    console.log(`Set ${key} = ${value}`);
  }

  console.log('\nContact settings saved successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
