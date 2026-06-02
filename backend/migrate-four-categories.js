const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categoriesData = [
  {
    name: "Western",
    slug: "western",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
    order: 1,
    subcategories: [
      { name: "Necklace", group: "Shop By Type" },
      { name: "Earrings", group: "Shop By Type" },
      { name: "Rings", group: "Shop By Type" },
      { name: "Bracelets", group: "Shop By Type" }
    ]
  },
  {
    name: "Ethnic",
    slug: "ethnic",
    image: "https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=800",
    order: 2,
    subcategories: [
      { name: "Jhumkas", group: "Shop By Type" },
      { name: "Chokers", group: "Shop By Type" },
      { name: "Bangles", group: "Shop By Type" },
      { name: "Mangalsutra", group: "Shop By Type" }
    ]
  },
  {
    name: "Whats New",
    slug: "whats-new",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
    order: 3,
    subcategories: [
      { name: "New Arrivals", group: "Shop By Type" }
    ]
  },
  {
    name: "Best Seller",
    slug: "best-seller",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
    order: 4,
    subcategories: [
      { name: "Trending", group: "Shop By Type" }
    ]
  }
];

function generateSlug(name, categorySlug) {
  return `${categorySlug}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`;
}

async function main() {
  console.log('Starting category migration to exactly 4 categories...');

  // 1. Create or get the new categories and subcategories
  const createdCats = [];
  for (const cat of categoriesData) {
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
    createdCats.push(category);

    // Create subcategories under this category
    for (let i = 0; i < cat.subcategories.length; i++) {
      const sub = cat.subcategories[i];
      const subSlug = generateSlug(sub.name, cat.slug);
      let subcategory = await prisma.subcategory.findUnique({ where: { slug: subSlug } });
      if (!subcategory) {
        await prisma.subcategory.create({
          data: {
            name: sub.name,
            slug: subSlug,
            description: sub.group,
            categoryId: category.id,
            isActive: true,
            order: i + 1,
            image: cat.image
          }
        });
        console.log(`Created subcategory: ${sub.name} in ${cat.name}`);
      } else {
        await prisma.subcategory.update({
          where: { id: subcategory.id },
          data: {
            categoryId: category.id,
            description: sub.group
          }
        });
      }
    }
  }

  const westernCat = createdCats.find(c => c.slug === 'western');
  const westernSub = await prisma.subcategory.findFirst({ where: { categoryId: westernCat.id } });

  // 2. Assign all existing products to 'Western' category and its first subcategory
  console.log(`Assigning all products to '${westernCat.name}' category to prevent orphan database records...`);
  await prisma.product.updateMany({
    data: {
      categoryId: westernCat.id,
      subcategoryId: westernSub ? westernSub.id : null
    }
  });
  console.log('Products updated.');

  // 3. Delete any categories that are NOT in the new list
  const validCategoryIds = createdCats.map(c => c.id);
  const oldCats = await prisma.category.findMany({
    where: { id: { notIn: validCategoryIds } }
  });

  for (const oc of oldCats) {
    // Delete subcategories first due to foreign keys
    await prisma.subcategory.deleteMany({ where: { categoryId: oc.id } });
    await prisma.category.delete({ where: { id: oc.id } });
    console.log(`Deleted old category: ${oc.name}`);
  }

  console.log('Category migration complete!');
}

main()
  .catch(e => console.error('Migration failed:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
