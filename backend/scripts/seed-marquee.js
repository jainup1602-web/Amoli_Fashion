const prisma = require('../src/lib/prisma');

const marqueeData = [
  // Row 1 - Right to Left
  { text: 'Gemstone Jewellery', filterSlug: 'gemstone', row: 1, order: 1 },
  { text: 'Pearl Jewellery', filterSlug: 'pearl', row: 1, order: 2 },
  { text: 'Chunky Necklaces', filterSlug: 'chunky-necklaces', row: 1, order: 3 },
  { text: 'Bridal Collection', filterSlug: 'bridal', row: 1, order: 4 },
  { text: 'Statement Earrings', filterSlug: 'earrings', row: 1, order: 5 },
  { text: 'Oxidised Jewellery', filterSlug: 'oxidised', row: 1, order: 6 },
  
  // Row 2 - Left to Right
  { text: 'Semi Precious Stones', filterSlug: 'semi-precious', row: 2, order: 1 },
  { text: 'Enamel Jewellery', filterSlug: 'enamel', row: 2, order: 2 },
  { text: 'Layered Necklaces', filterSlug: 'layered-necklaces', row: 2, order: 3 },
  { text: 'Off-Shoulder Pieces', filterSlug: 'off-shoulder', row: 2, order: 4 },
  { text: 'Navratna Collection', filterSlug: 'navratna', row: 2, order: 5 },
  { text: 'Temple Jewellery', filterSlug: 'temple', row: 2, order: 6 },
];

async function seedMarquee() {
  console.log('🌱 Seeding marquee items...');
  
  try {
    // Delete existing items
    await prisma.marqueeitem.deleteMany({});
    console.log('✅ Cleared existing items');

    // Insert new items
    for (const item of marqueeData) {
      await prisma.marqueeitem.create({
        data: {
          text: item.text,
          filterSlug: item.filterSlug,
          row: item.row,
          order: item.order,
          isActive: true,
        },
      });
      console.log(`✅ Added: ${item.text} (Row ${item.row})`);
    }

    console.log('\n🎉 Successfully seeded', marqueeData.length, 'marquee items!');
    console.log('\n📍 Next steps:');
    console.log('1. Go to http://localhost:3001/admin/marquee');
    console.log('2. Add hover images to items');
    console.log('3. Check homepage to see the marquee in action!');
    
  } catch (error) {
    console.error('❌ Error seeding marquee:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMarquee();
