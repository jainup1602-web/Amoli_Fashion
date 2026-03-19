// Script to update all products with multiple real jewelry images from Unsplash
// Run: node scripts/seed-product-images.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Real Unsplash jewelry images — 3-4 images per product type
const PRODUCT_IMAGES = {
  // Necklaces
  'gold-pendant-necklace': [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  ],
  'diamond-choker-necklace': [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
  ],
  // Earrings
  'gold-hoop-earrings': [
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80',
    'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
    'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
  ],
  'traditional-jhumkas': [
    'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80',
    'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
  ],
  'pearl-drop-earrings': [
    'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80',
  ],
  'diamond-stud-earrings': [
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80',
    'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
  ],
  // Rings
  'diamond-solitaire-ring': [
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=600&q=80',
    'https://images.unsplash.com/photo-1586104195538-050b9f74f58e?w=600&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  ],
  'ruby-fashion-ring': [
    'https://images.unsplash.com/photo-1586104195538-050b9f74f58e?w=600&q=80',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=600&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  ],
  'gold-wedding-band': [
    'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=600&q=80',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    'https://images.unsplash.com/photo-1586104195538-050b9f74f58e?w=600&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  ],
  // Bracelets
  'diamond-tennis-bracelet': [
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
    'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  ],
  'gold-chain-bracelet': [
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
    'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  ],
  // Chains
  'gold-chain-22k': [
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
  ],
  'platinum-chain': [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  ],
  // Bangles
  'gold-kada-bangles-set': [
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
    'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  ],
};

// Fallback images for any product not in the map
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
];

async function main() {
  console.log('Fetching all products...');
  const products = await prisma.product.findMany({ select: { id: true, slug: true, name: true } });
  console.log(`Found ${products.length} products\n`);

  for (const product of products) {
    const images = PRODUCT_IMAGES[product.slug] || FALLBACK_IMAGES;
    await prisma.product.update({
      where: { id: product.id },
      data: { images: JSON.stringify(images) },
    });
    console.log(`✓ Updated: ${product.name} (${images.length} images)`);
  }

  console.log('\nAll products updated with multiple images!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
