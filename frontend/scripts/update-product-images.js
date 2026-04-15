// Add second (hover) image to all products that have only 1 image
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Curated Unsplash jewelry images — 2 per category (primary, hover)
const categoryImages = {
  rings: [
    ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80'],
    ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80', 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80'],
    ['https://images.unsplash.com/photo-1586104195538-050b9f74f58e?w=600&q=80', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80'],
    ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'],
    ['https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80'],
    ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80', 'https://images.unsplash.com/photo-1586104195538-050b9f74f58e?w=600&q=80'],
  ],
  earrings: [
    ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=600&q=80'],
    ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80', 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80'],
    ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80', 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80'],
    ['https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=600&q=80', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'],
    ['https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80'],
    ['https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80'],
  ],
  necklaces: [
    ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80'],
    ['https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80', 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80'],
    ['https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80', 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80'],
    ['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80', 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80'],
    ['https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80', 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80'],
    ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80', 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80'],
  ],
  bangles: [
    ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80'],
    ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80'],
    ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80'],
    ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'],
    ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80'],
  ],
  bracelets: [
    ['https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'],
    ['https://images.unsplash.com/photo-1586104195538-050b9f74f58e?w=600&q=80', 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80'],
    ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80', 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80'],
    ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80', 'https://images.unsplash.com/photo-1586104195538-050b9f74f58e?w=600&q=80'],
    ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80'],
  ],
  chains: [
    ['https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80', 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80'],
    ['https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80', 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80'],
    ['https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80', 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80'],
    ['https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80', 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80'],
    ['https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80', 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80'],
  ],
};

const categorySlugMap = {
  '4a6b5c36-3ba2-494a-af49-713eaa3a56d5': 'rings',
  '63213006-55bf-4384-b314-1febc83c9c56': 'earrings',
  '1ddc6f6c-048e-4862-9378-c990269e465f': 'necklaces',
  '1e0fa714-3a5f-4cd5-8e5a-0dd4633dd998': 'bangles',
  '8fcf5b17-b769-448d-9703-f2aa116b2bd2': 'bracelets',
  '12490941-4bd2-45d8-82c4-4da686c90eb5': 'chains',
};

async function main() {
  console.log('Updating product images (adding hover images)...');

  const products = await prisma.product.findMany({
    select: { id: true, name: true, images: true, categoryId: true },
  });

  // Track index per category for cycling through image pairs
  const catIndex = {};

  let updated = 0;
  for (const product of products) {
    let imgs = [];
    try {
      imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
    } catch { imgs = []; }

    // Only update if less than 2 images
    if (imgs.length >= 2) {
      console.log(`⏭  Already has 2 images: ${product.name}`);
      continue;
    }

    const catSlug = categorySlugMap[product.categoryId];
    if (!catSlug || !categoryImages[catSlug]) {
      console.log(`⚠  Unknown category for: ${product.name}`);
      continue;
    }

    const pairs = categoryImages[catSlug];
    const idx = catIndex[catSlug] || 0;
    const pair = pairs[idx % pairs.length];
    catIndex[catSlug] = idx + 1;

    await prisma.product.update({
      where: { id: product.id },
      data: { images: JSON.stringify(pair) },
    });
    console.log(`✅ Updated: ${product.name}`);
    updated++;
  }

  console.log(`\n✅ Done! Updated ${updated} products with hover images.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
