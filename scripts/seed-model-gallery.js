// Seed model gallery with Unsplash jewelry/saree model images
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const models = [
  {
    modelName: 'Priya - Daily Wear',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
    description: 'Elegant daily wear jewelry collection',
    category: 'Daily Wear',
    order: 1,
  },
  {
    modelName: 'Ananya - Office Wear',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80',
    description: 'Sophisticated office wear jewelry',
    category: 'Office Wear',
    order: 2,
  },
  {
    modelName: 'Meera - Party Wear',
    image: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=600&q=80',
    description: 'Glamorous party wear jewelry',
    category: 'Party Wear',
    order: 3,
  },
  {
    modelName: 'Kavya - Bridal',
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80',
    description: 'Stunning bridal jewelry collection',
    category: 'Bridal',
    order: 4,
  },
  {
    modelName: 'Sneha - Casual',
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
    description: 'Casual everyday jewelry',
    category: 'Casual',
    order: 5,
  },
  {
    modelName: 'Riya - Festive',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',
    description: 'Festive occasion jewelry',
    category: 'Festive',
    order: 6,
  },
  {
    modelName: 'Divya - Traditional',
    image: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=600&q=80',
    description: 'Traditional jewelry collection',
    category: 'Traditional',
    order: 7,
  },
  {
    modelName: 'Nisha - Contemporary',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=80',
    description: 'Contemporary modern jewelry',
    category: 'Contemporary',
    order: 8,
  },
];

async function main() {
  console.log('Seeding model gallery...');

  // Clear existing
  await prisma.modelgallery.deleteMany({});
  console.log('Cleared existing model gallery entries');

  for (const model of models) {
    await prisma.modelgallery.create({
      data: {
        ...model,
        isActive: true,
      },
    });
    console.log(`✅ Added: ${model.modelName}`);
  }

  console.log('\n✅ Model gallery seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
