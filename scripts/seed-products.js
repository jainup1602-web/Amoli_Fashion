const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = {
  rings:     '4a6b5c36-3ba2-494a-af49-713eaa3a56d5',
  earrings:  '63213006-55bf-4384-b314-1febc83c9c56',
  necklaces: '1ddc6f6c-048e-4862-9378-c990269e465f',
  bangles:   '1e0fa714-3a5f-4cd5-8e5a-0dd4633dd998',
  bracelets: '8fcf5b17-b769-448d-9703-f2aa116b2bd2',
  chains:    '12490941-4bd2-45d8-82c4-4da686c90eb5',
};

// Unsplash jewelry images (portrait/product style)
const images = {
  rings: [
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
    'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
    'https://images.unsplash.com/photo-1586104195538-050b9f74f58e?w=600&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  ],
  earrings: [
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80',
    'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
    'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
    'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80',
  ],
  necklaces: [
    'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
    'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80',
    'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
  ],
  bangles: [
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80',
  ],
  bracelets: [
    'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
    'https://images.unsplash.com/photo-1586104195538-050b9f74f58e?w=600&q=80',
    'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80',
    'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
  ],
  chains: [
    'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80',
    'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80',
    'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80',
    'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80',
  ],
};

const products = [
  // RINGS (6)
  { name: 'Eternal Rose Gold Ring', slug: 'eternal-rose-gold-ring', category: 'rings', price: 2499, special: 1999, material: 'Rose Gold', purity: '18K', occasion: 'Wedding', gender: 'Women', img: 0 },
  { name: 'Diamond Solitaire Ring', slug: 'diamond-solitaire-ring', category: 'rings', price: 8999, special: 7499, material: 'White Gold', purity: '18K', occasion: 'Engagement', gender: 'Women', img: 1 },
  { name: 'Classic Gold Band Ring', slug: 'classic-gold-band-ring', category: 'rings', price: 3499, special: null, material: 'Yellow Gold', purity: '22K', occasion: 'Daily Wear', gender: 'Unisex', img: 2 },
  { name: 'Floral Kundan Ring', slug: 'floral-kundan-ring', category: 'rings', price: 1899, special: 1499, material: 'Gold Plated', purity: null, occasion: 'Festive', gender: 'Women', img: 3 },
  { name: 'Men\'s Signet Ring', slug: 'mens-signet-ring', category: 'rings', price: 4299, special: 3799, material: 'Sterling Silver', purity: '925', occasion: 'Casual', gender: 'Men', img: 4 },
  { name: 'Twisted Infinity Ring', slug: 'twisted-infinity-ring', category: 'rings', price: 2199, special: 1799, material: 'Rose Gold', purity: '14K', occasion: 'Daily Wear', gender: 'Women', img: 5 },

  // EARRINGS (6)
  { name: 'Pearl Drop Earrings', slug: 'pearl-drop-earrings', category: 'earrings', price: 1799, special: 1399, material: 'Gold Plated', purity: null, occasion: 'Party', gender: 'Women', img: 0 },
  { name: 'Diamond Stud Earrings', slug: 'diamond-stud-earrings', category: 'earrings', price: 5999, special: 4999, material: 'White Gold', purity: '18K', occasion: 'Daily Wear', gender: 'Women', img: 1 },
  { name: 'Jhumka Gold Earrings', slug: 'jhumka-gold-earrings', category: 'earrings', price: 3299, special: 2799, material: 'Yellow Gold', purity: '22K', occasion: 'Festive', gender: 'Women', img: 2 },
  { name: 'Hoop Silver Earrings', slug: 'hoop-silver-earrings', category: 'earrings', price: 999, special: 799, material: 'Sterling Silver', purity: '925', occasion: 'Casual', gender: 'Women', img: 3 },
  { name: 'Chandbali Earrings', slug: 'chandbali-earrings', category: 'earrings', price: 4499, special: 3699, material: 'Gold Plated', purity: null, occasion: 'Bridal', gender: 'Women', img: 4 },
  { name: 'Emerald Drop Earrings', slug: 'emerald-drop-earrings', category: 'earrings', price: 6999, special: 5999, material: 'Yellow Gold', purity: '18K', occasion: 'Party', gender: 'Women', img: 5 },

  // NECKLACES (6)
  { name: 'Layered Gold Necklace', slug: 'layered-gold-necklace', category: 'necklaces', price: 7499, special: 6299, material: 'Yellow Gold', purity: '22K', occasion: 'Bridal', gender: 'Women', img: 0 },
  { name: 'Diamond Pendant Necklace', slug: 'diamond-pendant-necklace', category: 'necklaces', price: 12999, special: 10999, material: 'White Gold', purity: '18K', occasion: 'Party', gender: 'Women', img: 1 },
  { name: 'Mangalsutra Classic', slug: 'mangalsutra-classic', category: 'necklaces', price: 5499, special: 4499, material: 'Yellow Gold', purity: '22K', occasion: 'Wedding', gender: 'Women', img: 2 },
  { name: 'Pearl Strand Necklace', slug: 'pearl-strand-necklace', category: 'necklaces', price: 3999, special: 3299, material: 'Gold Plated', purity: null, occasion: 'Festive', gender: 'Women', img: 3 },
  { name: 'Kundan Choker Necklace', slug: 'kundan-choker-necklace', category: 'necklaces', price: 8999, special: 7499, material: 'Gold Plated', purity: null, occasion: 'Bridal', gender: 'Women', img: 4 },
  { name: 'Minimalist Bar Necklace', slug: 'minimalist-bar-necklace', category: 'necklaces', price: 1999, special: 1599, material: 'Sterling Silver', purity: '925', occasion: 'Daily Wear', gender: 'Women', img: 5 },

  // BANGLES (5)
  { name: 'Gold Kada Bangle Set', slug: 'gold-kada-bangle-set', category: 'bangles', price: 9999, special: 8499, material: 'Yellow Gold', purity: '22K', occasion: 'Bridal', gender: 'Women', img: 0 },
  { name: 'Meenakari Bangle Set', slug: 'meenakari-bangle-set', category: 'bangles', price: 4999, special: 3999, material: 'Gold Plated', purity: null, occasion: 'Festive', gender: 'Women', img: 1 },
  { name: 'Diamond Cut Bangles', slug: 'diamond-cut-bangles', category: 'bangles', price: 6499, special: 5499, material: 'Yellow Gold', purity: '18K', occasion: 'Party', gender: 'Women', img: 2 },
  { name: 'Silver Oxidised Bangles', slug: 'silver-oxidised-bangles', category: 'bangles', price: 1299, special: 999, material: 'Sterling Silver', purity: '925', occasion: 'Casual', gender: 'Women', img: 3 },
  { name: 'Antique Gold Bangles', slug: 'antique-gold-bangles', category: 'bangles', price: 7999, special: 6799, material: 'Yellow Gold', purity: '22K', occasion: 'Wedding', gender: 'Women', img: 4 },

  // BRACELETS (5)
  { name: 'Tennis Diamond Bracelet', slug: 'tennis-diamond-bracelet', category: 'bracelets', price: 15999, special: 13499, material: 'White Gold', purity: '18K', occasion: 'Party', gender: 'Women', img: 0 },
  { name: 'Gold Chain Bracelet', slug: 'gold-chain-bracelet', category: 'bracelets', price: 4999, special: 4199, material: 'Yellow Gold', purity: '22K', occasion: 'Daily Wear', gender: 'Women', img: 1 },
  { name: 'Charm Bracelet Silver', slug: 'charm-bracelet-silver', category: 'bracelets', price: 2499, special: 1999, material: 'Sterling Silver', purity: '925', occasion: 'Casual', gender: 'Women', img: 2 },
  { name: 'Men\'s Leather Gold Bracelet', slug: 'mens-leather-gold-bracelet', category: 'bracelets', price: 3299, special: 2799, material: 'Gold Plated', purity: null, occasion: 'Casual', gender: 'Men', img: 3 },
  { name: 'Beaded Gemstone Bracelet', slug: 'beaded-gemstone-bracelet', category: 'bracelets', price: 1799, special: 1399, material: 'Gold Plated', purity: null, occasion: 'Daily Wear', gender: 'Women', img: 4 },

  // CHAINS (5)
  { name: 'Figaro Gold Chain', slug: 'figaro-gold-chain', category: 'chains', price: 6999, special: 5999, material: 'Yellow Gold', purity: '22K', occasion: 'Daily Wear', gender: 'Men', img: 0 },
  { name: 'Box Link Silver Chain', slug: 'box-link-silver-chain', category: 'chains', price: 2999, special: 2499, material: 'Sterling Silver', purity: '925', occasion: 'Casual', gender: 'Unisex', img: 1 },
  { name: 'Rope Gold Chain', slug: 'rope-gold-chain', category: 'chains', price: 8499, special: 7199, material: 'Yellow Gold', purity: '22K', occasion: 'Party', gender: 'Men', img: 2 },
  { name: 'Curb Chain Necklace', slug: 'curb-chain-necklace', category: 'chains', price: 4499, special: 3799, material: 'White Gold', purity: '18K', occasion: 'Casual', gender: 'Unisex', img: 3 },
  { name: 'Wheat Chain Gold', slug: 'wheat-chain-gold', category: 'chains', price: 5999, special: 4999, material: 'Yellow Gold', purity: '18K', occasion: 'Daily Wear', gender: 'Women', img: 4 },
];

async function main() {
  console.log('Seeding products...');

  // Check existing slugs to avoid duplicates
  const existing = await prisma.product.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map(p => p.slug));

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    if (existingSlugs.has(p.slug)) {
      console.log(`⏭  Skipped (exists): ${p.name}`);
      skipped++;
      continue;
    }

    const catImages = images[p.category];
    const img = catImages[p.img % catImages.length];
    const discount = p.special ? Math.round(((p.price - p.special) / p.price) * 100) : 0;

    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: `Beautiful ${p.name} crafted in ${p.material}${p.purity ? ` (${p.purity})` : ''}. Perfect for ${p.occasion} occasions. A timeless piece that adds elegance to any look.`,
        shortDescription: `${p.material} ${p.name.toLowerCase()} for ${p.occasion}`,
        categoryId: categories[p.category],
        originalPrice: p.price,
        specialPrice: p.special,
        discountPercentage: discount,
        stock: Math.floor(Math.random() * 50) + 10,
        sku: `SKU-${p.slug.toUpperCase().replace(/-/g, '').slice(0, 10)}-${Date.now().toString().slice(-4)}`,
        images: JSON.stringify([img]),
        material: p.material,
        purity: p.purity,
        occasion: p.occasion,
        gender: p.gender,
        isFeatured: true,
        isActive: true,
        salesCount: Math.floor(Math.random() * 200) + 10,
        tags: JSON.stringify([p.category, p.material, p.occasion, p.gender].filter(Boolean)),
      },
    });
    console.log(`✅ Created: ${p.name}`);
    created++;
  }

  console.log(`\n✅ Done! Created: ${created}, Skipped: ${skipped}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
