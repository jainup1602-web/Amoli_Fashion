const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const desiredSequence = [
  {
    name: "Necklace",
    groups: [
      {
        name: "Shop By Type",
        items: [
          "Pendant Set & Chain",
          "Short Necklace",
          "Long Necklace",
          "Choker",
          "Layered Necklace",
          "Mangalsutra"
        ]
      },
      {
        name: "Shop By Look",
        items: [
          "Kundan",
          "Gold Plated",
          "Cubic Zirconia / AD",
          "Stainless Steel",
          "Temple",
          "Crystal",
          "Oxidised",
          "Pearl"
        ]
      },
      {
        name: "Shop By Occasion",
        items: [
          "Traditional Wear",
          "Office Wear",
          "Modern Wear",
          "Casual Wear"
        ]
      }
    ]
  },
  {
    name: "Earrings",
    groups: [
      {
        name: "Shop By Type",
        items: [
          "Studs",
          "Hoops & Huggies",
          "Drop & Danglers",
          "Jhumka",
          "Chand Balis"
        ]
      },
      {
        name: "Shop By Look",
        items: [
          "Kundan",
          "Gold Plated",
          "Cubic Zirconia / AD",
          "Stainless Steel",
          "Temple",
          "Crystal",
          "Oxidised",
          "Pearl"
        ]
      },
      {
        name: "Shop By Occasion",
        items: [
          "Traditional Wear",
          "Office Wear",
          "Modern Wear",
          "Casual Wear"
        ]
      }
    ]
  },
  {
    name: "Bangles",
    groups: [
      {
        name: "Shop By Type",
        items: [
          "Kadas",
          "Bangles",
          "Bracelet",
          "Watch"
        ]
      },
      {
        name: "Shop By Look",
        items: [
          "Kundan",
          "Gold Plated",
          "Cubic Zirconia / AD",
          "Stainless Steel",
          "Temple",
          "Crystal",
          "Pearl",
          "Oxidised"
        ]
      },
      {
        name: "Shop By Occasion",
        items: [
          "Traditional Wear",
          "Office Wear",
          "Modern Wear",
          "Casual Wear"
        ]
      }
    ]
  },
  {
    name: "Rings",
    groups: [
      {
        name: "Shop By Type",
        items: [
          "Single Rings",
          "Double Rings",
          "Palm Cuffs"
        ]
      },
      {
        name: "Shop By Look",
        items: [
          "Kundan",
          "Gold Plated",
          "Cubic Zirconia / AD",
          "Stainless Steel",
          "Temple",
          "Crystal",
          "Pearl",
          "Oxidised"
        ]
      },
      {
        name: "Shop By Occasion",
        items: [
          "Traditional Wear",
          "Office Wear",
          "Modern Wear",
          "Casual Wear"
        ]
      }
    ]
  },
  {
    name: "Jewellery Accessories",
    groups: [
      {
        name: "Head Accessories",
        items: [
          "Maang Tikka",
          "Sheeshphool / Matha Patti",
          "Hair Brooch"
        ]
      },
      {
        name: "Hand Accessories",
        items: [
          "Hathphool / Palm Bracelet",
          "Baju Band / Armlet"
        ]
      },
      {
        name: "Others",
        items: [
          "Nath / Nose Pin",
          "Waist Belt / Kamar Bandh",
          "Anklet",
          "Saree Brooch"
        ]
      }
    ]
  },
  {
    name: "Amoli Vacay Vibes",
    groups: [
      {
        name: "Amoli Vacay Vibes",
        items: [
          "Necklace",
          "Rings",
          "Earring",
          "Bracelet"
        ]
      }
    ]
  }
];

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

async function main() {
  console.log('Starting category fix — capitalisation & spelling corrections...');

  const defaultImage = "https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=800";

  let catOrder = 1;
  const validCategoryIds = [];
  const validSubcategoryIds = [];

  for (const cat of desiredSequence) {
    const catSlug = slugify(cat.name);
    
    let category = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: cat.name,
          slug: catSlug,
          description: `Shop ${cat.name} Collection`,
          image: defaultImage,
          order: catOrder,
          isActive: true
        }
      });
      console.log(`Created category: ${cat.name}`);
    } else {
      category = await prisma.category.update({
        where: { id: category.id },
        data: { name: cat.name, order: catOrder, isActive: true }
      });
      console.log(`Updated category: ${cat.name}`);
    }
    
    validCategoryIds.push(category.id);

    let subOrder = 1;
    for (const group of cat.groups) {
      for (const item of group.items) {
        const subSlug = slugify(`${catSlug}-${item}`);
        
        let subcategory = await prisma.subcategory.findUnique({ where: { slug: subSlug } });
        if (!subcategory) {
          subcategory = await prisma.subcategory.create({
            data: {
              name: item,
              slug: subSlug,
              description: group.name,
              categoryId: category.id,
              image: defaultImage,
              order: subOrder,
              isActive: true
            }
          });
          console.log(`  Created: ${item} (${group.name})`);
        } else {
          subcategory = await prisma.subcategory.update({
            where: { id: subcategory.id },
            data: {
              name: item,
              description: group.name,
              order: subOrder,
              categoryId: category.id,
              isActive: true
            }
          });
          console.log(`  Updated: ${item} (${group.name})`);
        }
        validSubcategoryIds.push(subcategory.id);
        subOrder++;
      }
    }
    catOrder++;
  }

  // Deactivate anything NOT in our valid list
  const hiddenCats = await prisma.category.updateMany({
    where: { id: { notIn: validCategoryIds } },
    data: { isActive: false }
  });
  console.log(`\nDeactivated ${hiddenCats.count} old categories.`);

  const hiddenSubs = await prisma.subcategory.updateMany({
    where: { id: { notIn: validSubcategoryIds } },
    data: { isActive: false }
  });
  console.log(`Deactivated ${hiddenSubs.count} old subcategories.`);

  console.log('\n✅ Category fix complete — all names capitalised, spellings corrected!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
