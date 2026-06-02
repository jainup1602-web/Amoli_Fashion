const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const finalCategories = [
  {
    name: "Necklace",
    slug: "necklace",
    image: "https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=800",
    order: 1,
    subcategories: [
      { name: "pendant set & chain", group: "Shop By Type" },
      { name: "short necklace", group: "Shop By Type" },
      { name: "long necklace", group: "Shop By Type" },
      { name: "CHOKER", group: "Shop By Type" },
      { name: "Layered Necklace", group: "Shop By Type" },
      { name: "Mangalsutra", group: "Shop By Type" },
      { name: "Kundan", group: "Shop By Look" },
      { name: "Gold plated", group: "Shop By Look" },
      { name: "Cubic Zirconia / AD", group: "Shop By Look" },
      { name: "Stainless steel", group: "Shop By Look" },
      { name: "Temple", group: "Shop By Look" },
      { name: "Crystal", group: "Shop By Look" },
      { name: "Oxidised", group: "Shop By Look" },
      { name: "Pearl", group: "Shop By Look" },
      { name: "Traditional Wear", group: "Shop By Occasion" },
      { name: "office wear", group: "Shop By Occasion" },
      { name: "Modern Wear", group: "Shop By Occasion" },
      { name: "Casual Wear", group: "Shop By Occasion" }
    ]
  },
  {
    name: "Earrings",
    slug: "earrings",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
    order: 2,
    subcategories: [
      { name: "STuds", group: "Shop By Type" },
      { name: "Hoops & Huggies", group: "Shop By Type" },
      { name: "Drop & Danglers", group: "Shop By Type" },
      { name: "Jhumka", group: "Shop By Type" },
      { name: "chandBalis", group: "Shop By Type" },
      { name: "Kundan", group: "Shop By Look" },
      { name: "Gold plated", group: "Shop By Look" },
      { name: "Cubic Zirconia / AD", group: "Shop By Look" },
      { name: "Stainless steel", group: "Shop By Look" },
      { name: "Temple", group: "Shop By Look" },
      { name: "Crystal", group: "Shop By Look" },
      { name: "Oxidised", group: "Shop By Look" },
      { name: "pearl", group: "Shop By Look" },
      { name: "Traditional Wear", group: "Shop By Occasion" },
      { name: "office Wear", group: "Shop By Occasion" },
      { name: "Modern Wear", group: "Shop By Occasion" },
      { name: "Casual Wear", group: "Shop By Occasion" }
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
      { name: "Gold plated", group: "Shop By Look" },
      { name: "Cubic Zirconia / AD", group: "Shop By Look" },
      { name: "Stainless steel", group: "Shop By Look" },
      { name: "Temple", group: "Shop By Look" },
      { name: "Crystal", group: "Shop By Look" },
      { name: "Pearl", group: "Shop By Look" },
      { name: "oxidised", group: "Shop By Look" },
      { name: "Traditional Wear", group: "Shop By Occasion" },
      { name: "office wear", group: "Shop By Occasion" },
      { name: "Modern Wear", group: "Shop By Occasion" },
      { name: "Casual Wear", group: "Shop By Occasion" }
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
      { name: "palm Cuffs", group: "Shop By Type" },
      { name: "Kundan", group: "Shop By Look" },
      { name: "Gold plated", group: "Shop By Look" },
      { name: "Cubic Zirconia / AD", group: "Shop By Look" },
      { name: "Stainless steel", group: "Shop By Look" },
      { name: "Temple", group: "Shop By Look" },
      { name: "Crystal", group: "Shop By Look" },
      { name: "Pearl", group: "Shop By Look" },
      { name: "oxidised", group: "Shop By Look" },
      { name: "Traditional Wear", group: "Shop By Occasion" },
      { name: "office wear", group: "Shop By Occasion" },
      { name: "Modern Wear", group: "Shop By Occasion" },
      { name: "Casual Wear", group: "Shop By Occasion" }
    ]
  },
  {
    name: "Jewellery Accessories",
    slug: "jewellery-accessories",
    image: "https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=800",
    order: 5,
    subcategories: [
      { name: "maang Tikka", group: "Head Accessories" },
      { name: "sheeshphool / matha patti", group: "Head Accessories" },
      { name: "Hair Brooch", group: "Head Accessories" },
      { name: "Hathphool / Palm Bracelet", group: "Hand Accessories" },
      { name: "BAJu Band / Armlet", group: "Hand Accessories" },
      { name: "Nath / Nose Pin", group: "others" },
      { name: "Waist Belt / Kamar Bandh", group: "others" },
      { name: "Anklet", group: "others" },
      { name: "Saree Brooch", group: "others" }
    ]
  },
  {
    name: "Amoli Vacay Vibes",
    slug: "amoli-vacay-vibes",
    image: "https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=800",
    order: 6,
    subcategories: [
      { name: "Necklace", group: "Amoli Vacay Vibes" },
      { name: "Ring", group: "Amoli Vacay Vibes" },
      { name: "Earring", group: "Amoli Vacay Vibes" },
      { name: "Bracelet", group: "Amoli Vacay Vibes" }
    ]
  }
];

function generateSlug(name, categorySlug) {
  return `${categorySlug}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`;
}

async function main() {
  console.log('Starting highly optimized final category migration...');

  // 1. Ensure the main 'Necklace' category exists
  let necklaceCategory = await prisma.category.findUnique({ where: { slug: 'necklace' } });
  if (!necklaceCategory) {
    necklaceCategory = await prisma.category.create({
      data: {
        name: "Necklace",
        slug: "necklace",
        description: "Shop Necklace Collection",
        image: "https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=800",
        order: 1,
        isActive: true
      }
    });
    console.log('Created temporary Necklace category');
  }

  // 2. Assign all existing products to the Necklace category to prevent orphan constraints
  console.log('Re-routing all products to Necklace category...');
  await prisma.product.updateMany({
    data: {
      categoryId: necklaceCategory.id,
      subcategoryId: null
    }
  });
  console.log('Products re-routed successfully.');

  // 3. Clear all subcategories from the database (prevents primary key conflicts and duplicate slug errors)
  console.log('Clearing old subcategories...');
  await prisma.subcategory.deleteMany({});
  console.log('Old subcategories cleared.');

  // 4. Create/update the 6 categories
  const categoryIdMap = {};
  for (const cat of finalCategories) {
    let category = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: `Shop ${cat.name} Collection`,
          image: cat.image,
          order: cat.order,
          isActive: true
        }
      });
      console.log(`Created category: ${cat.name}`);
    } else {
      category = await prisma.category.update({
        where: { id: category.id },
        data: {
          name: cat.name,
          image: cat.image,
          order: cat.order,
          isActive: true
        }
      });
      console.log(`Updated category: ${cat.name}`);
    }
    categoryIdMap[cat.slug] = category.id;
  }

  // 5. Delete other categories that are not part of the 6 final categories
  console.log('Deleting unused categories...');
  const validCategoryIds = Object.values(categoryIdMap);
  await prisma.category.deleteMany({
    where: { id: { notIn: validCategoryIds } }
  });
  console.log('Unused categories deleted.');

  // 6. Bulk create subcategories in a single transaction
  console.log('Bulk creating subcategories...');
  const subcategoryDataList = [];
  for (const cat of finalCategories) {
    const categoryId = categoryIdMap[cat.slug];
    for (let i = 0; i < cat.subcategories.length; i++) {
      const sub = cat.subcategories[i];
      subcategoryDataList.push({
        name: sub.name,
        slug: generateSlug(sub.name, cat.slug),
        description: sub.group,
        categoryId: categoryId,
        isActive: true,
        order: i + 1,
        image: cat.image
      });
    }
  }

  // Execute createMany for super-fast batch inserting!
  await prisma.subcategory.createMany({
    data: subcategoryDataList
  });
  console.log(`Successfully created all ${subcategoryDataList.length} subcategories!`);

  // 7. Associate products to Necklace's first subcategory if one exists
  const firstSub = await prisma.subcategory.findFirst({
    where: { categoryId: categoryIdMap['necklace'] }
  });
  if (firstSub) {
    await prisma.product.updateMany({
      data: {
        subcategoryId: firstSub.id
      }
    });
    console.log(`Associated products with subcategory: ${firstSub.name}`);
  }

  console.log('Highly optimized migration completed successfully!');
}

main()
  .catch(e => console.error('Migration failed:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
