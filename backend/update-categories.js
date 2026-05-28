const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const newCategories = [
  {
    name: "Necklace",
    slug: "necklace",
    image: "https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=800",
    order: 1,
    subcategories: [
      { name: "Pendant Set & Chain", group: "Shop By Type" },
      { name: "Short Necklace", group: "Shop By Type" },
      { name: "Long Necklace", group: "Shop By Type" },
      { name: "Choker", group: "Shop By Type" },
      { name: "Layered Necklace", group: "Shop By Type" },
      { name: "Mangalsutra", group: "Shop By Type" },
      
      { name: "Kundan", group: "Shop By Look" },
      { name: "Gold Plated", group: "Shop By Look" },
      { name: "Cubic Zirconia / AD", group: "Shop By Look" },
      { name: "Stainless Steel", group: "Shop By Look" },
      { name: "Temple", group: "Shop By Look" },
      { name: "Pearl", group: "Shop By Look" },
      { name: "Crystal", group: "Shop By Look" },
      { name: "Oxidised", group: "Shop By Look" },
      
      { name: "Traditional Wear", group: "Shop By Occasion" },
      { name: "Office Wear", group: "Shop By Occasion" },
      { name: "Modern Wear", group: "Shop By Occasion" },
      { name: "Casual Wear", group: "Shop By Occasion" },
    ]
  },
  {
    name: "Earrings",
    slug: "earrings",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
    order: 2,
    subcategories: [
      { name: "Studs", group: "Shop By Type" },
      { name: "Hoops & Huggies", group: "Shop By Type" },
      { name: "Drop & Danglers", group: "Shop By Type" },
      { name: "Jhumka", group: "Shop By Type" },
      { name: "Chandbalis", group: "Shop By Type" },
      
      { name: "Kundan", group: "Shop By Look" },
      { name: "Gold Plated", group: "Shop By Look" },
      { name: "CZ / AD", group: "Shop By Look" },
      { name: "Stainless Steel", group: "Shop By Look" },
      { name: "Temple", group: "Shop By Look" },
      { name: "Crystal", group: "Shop By Look" },
      { name: "Oxidised", group: "Shop By Look" },
      { name: "Pearl", group: "Shop By Look" },
      
      { name: "Traditional Wear", group: "Shop By Occasion" },
      { name: "Office Wear", group: "Shop By Occasion" },
      { name: "Modern Wear", group: "Shop By Occasion" },
      { name: "Casual Wear", group: "Shop By Occasion" },
    ]
  },
  {
    name: "Bangles",
    slug: "bangles",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
    order: 3,
    subcategories: [
      { name: "Kadas", group: "Shop By Type" },
      { name: "Bangles", group: "Shop By Type" },
      { name: "Bracelet", group: "Shop By Type" },
      { name: "Watch", group: "Shop By Type" },
      
      { name: "Kundan", group: "Shop By Look" },
      { name: "Gold Plated", group: "Shop By Look" },
      { name: "CZ / AD", group: "Shop By Look" },
      { name: "Stainless Steel", group: "Shop By Look" },
      { name: "Temple", group: "Shop By Look" },
      { name: "Crystal", group: "Shop By Look" },
      { name: "Pearl", group: "Shop By Look" },
      { name: "Oxidised", group: "Shop By Look" },
      
      { name: "Traditional Wear", group: "Shop By Occasion" },
      { name: "Office Wear", group: "Shop By Occasion" },
      { name: "Modern Wear", group: "Shop By Occasion" },
      { name: "Casual Wear", group: "Shop By Occasion" },
    ]
  },
  {
    name: "Rings",
    slug: "rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
    order: 4,
    subcategories: [
      { name: "Single Ring", group: "Shop By Type" },
      { name: "Double Ring", group: "Shop By Type" },
      { name: "Palm Cuffs", group: "Shop By Type" },
      
      { name: "Kundan", group: "Shop By Look" },
      { name: "Gold Plated", group: "Shop By Look" },
      { name: "CZ / AD", group: "Shop By Look" },
      { name: "Stainless Steel", group: "Shop By Look" },
      { name: "Temple", group: "Shop By Look" },
      { name: "Crystal", group: "Shop By Look" },
      { name: "Pearl", group: "Shop By Look" },
      { name: "Oxidised", group: "Shop By Look" },
      
      { name: "Traditional Wear", group: "Shop By Occasion" },
      { name: "Office Wear", group: "Shop By Occasion" },
      { name: "Modern Wear", group: "Shop By Occasion" },
      { name: "Casual Wear", group: "Shop By Occasion" },
    ]
  },
  {
    name: "Jewellery Accessories",
    slug: "jewellery-accessories",
    image: "https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=800",
    order: 5,
    subcategories: [
      { name: "Maang Tikka", group: "Head Accessories" },
      { name: "Sheeshphool / Matha Patti", group: "Head Accessories" },
      { name: "Hair Brooch", group: "Head Accessories" },
      
      { name: "Hathphool / Palm Bracelet", group: "Hand Accessories" },
      { name: "Baju Band / Armlet", group: "Hand Accessories" },
      
      { name: "Nath / Nose Pin", group: "Others" },
      { name: "Waist Belt / Kamar Bandh", group: "Others" },
      { name: "Anklet", group: "Others" },
      { name: "Saree Brooch", group: "Others" },
    ]
  },
  {
    name: "Amoli Vibes",
    slug: "amoli-vibes",
    image: "https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=800",
    order: 6,
    subcategories: [
      { name: "Necklace", group: "Amoli Vibes" },
      { name: "Ring", group: "Amoli Vibes" },
      { name: "Earring", group: "Amoli Vibes" },
      { name: "Bracelet", group: "Amoli Vibes" },
    ]
  }
];

function generateSlug(name, group, categorySlug) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const groupSlug = group.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `${categorySlug}-${groupSlug}-${base}`;
}

async function main() {
  console.log('Starting category migration...');
  
  // Create all new categories and subcategories
  const createdCats = [];
  for (const cat of newCategories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    let createdCat;
    if (!existing) {
      createdCat = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.name,
          image: cat.image,
          order: cat.order,
          isActive: true
        }
      });
      console.log(`Created category: ${cat.name}`);
    } else {
      createdCat = existing;
      console.log(`Category exists: ${cat.name}`);
    }
    createdCats.push(createdCat);
    
    // Create subcategories
    for (let i = 0; i < cat.subcategories.length; i++) {
      const sub = cat.subcategories[i];
      const subSlug = generateSlug(sub.name, sub.group, cat.slug);
      
      const existingSub = await prisma.subcategory.findUnique({ where: { slug: subSlug } });
      if (!existingSub) {
        await prisma.subcategory.create({
          data: {
            name: sub.name,
            slug: subSlug,
            description: sub.group, // using description to store the grouping
            categoryId: createdCat.id,
            isActive: true,
            order: i + 1,
            image: cat.image
          }
        });
        console.log(`Created subcategory: ${sub.name} in ${cat.name} (${sub.group})`);
      } else {
        await prisma.subcategory.update({
          where: { id: existingSub.id },
          data: { description: sub.group }
        });
      }
    }
  }
  
  // Assign all existing products to the first new category and subcategory so they don't break
  const firstCat = createdCats[0];
  const firstSub = await prisma.subcategory.findFirst({ where: { categoryId: firstCat.id } });
  
  console.log(`Updating all products to belong to ${firstCat.name}...`);
  await prisma.product.updateMany({
    data: {
      categoryId: firstCat.id,
      subcategoryId: firstSub.id
    }
  });
  console.log('Products updated.');
  
  // Now delete any category that is NOT in the new list
  const validCategoryIds = createdCats.map(c => c.id);
  const oldCats = await prisma.category.findMany({
    where: { id: { notIn: validCategoryIds } }
  });
  
  for (const oc of oldCats) {
    await prisma.subcategory.deleteMany({ where: { categoryId: oc.id } });
    await prisma.category.delete({ where: { id: oc.id } });
    console.log(`Deleted old category: ${oc.name}`);
  }
  
  console.log('Migration completed successfully!');
}

main().catch(e => {
  console.error(e);
}).finally(async () => {
  await prisma.$disconnect();
});
