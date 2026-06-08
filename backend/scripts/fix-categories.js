const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const desiredSequence = [
  {
    name: "Necklace",
    groups: [
      {
        name: "Shop by type",
        items: [
          "pendent set & chain",
          "Short Necklace",
          "Long Necklace",
          "CHOKER",
          "Layered Necklace",
          "Mangal Sutra"
        ]
      },
      {
        name: "shop by look",
        items: [
          "kundan",
          "gold plated",
          "cubic Zirconia /AD",
          "Stainless steal",
          "Tmple",
          "crystal",
          "oxidised",
          "pearl"
        ]
      },
      {
        name: "shop by occassion",
        items: [
          "traditional wear",
          "office wear",
          "modern wear",
          "casual wear"
        ]
      }
    ]
  },
  {
    name: "Earrings",
    groups: [
      {
        name: "shop by type",
        items: [
          "studs",
          "hoops & huggies",
          "drop & danglers",
          "jhumka",
          "chand balis"
        ]
      },
      {
        name: "shop by look",
        items: [
          "kundan",
          "gold plated",
          "cubic zirconia/AD",
          "stainless steal",
          "temple",
          "crystal",
          "oxidised",
          "pearl"
        ]
      },
      {
        name: "shop by occssion",
        items: [
          "traditional",
          "office wear",
          "modern wear",
          "casual wear"
        ]
      }
    ]
  },
  {
    name: "Bangles",
    groups: [
      {
        name: "shop by type",
        items: [
          "kadas",
          "bangles",
          "bracelate",
          "watch"
        ]
      },
      {
        name: "shop by look",
        items: [
          "kundan",
          "gold plated",
          "cubic zirconia/AD",
          "stainless steal",
          "temple",
          "crystal",
          "pearl",
          "oxidised"
        ]
      },
      {
        name: "shop by occssion",
        items: [
          "traditional",
          "office wear",
          "modern wear",
          "casual wear"
        ]
      }
    ]
  },
  {
    name: "Rings",
    groups: [
      {
        name: "shop by type",
        items: [
          "single rings",
          "double rings",
          "palm cuffs"
        ]
      },
      {
        name: "shop by look",
        items: [
          "kundan",
          "gold plated",
          "cubic zirconia/AD",
          "stainless steal",
          "temple",
          "crystal",
          "pearl",
          "oxidised"
        ]
      },
      {
        name: "shop by occssion",
        items: [
          "traditional",
          "office wear",
          "modern wear",
          "casual wear"
        ]
      }
    ]
  },
  {
    name: "jewellery accessories",
    groups: [
      {
        name: "Head Accessories",
        items: [
          "Maang Tikka",
          "sheeshphool/matha patti",
          "hail brooch"
        ]
      },
      {
        name: "Hand Accessories",
        items: [
          "Hath phool/palm bracelet",
          "Baju Band / Armlet"
        ]
      },
      {
        name: "others",
        items: [
          "Nath /nose pin",
          "Waist Belt /kamar Band",
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
  console.log('Starting category structural fix...');

  // Fallback image
  const defaultImage = "https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=800";

  let catOrder = 1;
  const validCategoryIds = [];
  const validSubcategoryIds = [];

  for (const cat of desiredSequence) {
    const catSlug = slugify(cat.name);
    
    // Find or create category
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
        data: { name: cat.name, order: catOrder }
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
          // Check if an old spelling exists under the same category to rename it instead of creating new
          // e.g. "pendent set & chain" -> "pendant set & chain"
          // We can do a fuzzy match, or just let it recreate.
          // Let's just create new, and leave the old one alone for a moment.
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
          console.log(`Created subcategory: ${item} (${group.name})`);
        } else {
          subcategory = await prisma.subcategory.update({
            where: { id: subcategory.id },
            data: {
              name: item,
              description: group.name,
              order: subOrder,
              categoryId: category.id
            }
          });
          console.log(`Updated subcategory: ${item}`);
        }
        validSubcategoryIds.push(subcategory.id);
        subOrder++;
      }
    }
    catOrder++;
  }

  // Hide/deactivate any categories or subcategories that are not in our exact valid list
  // so they don't show up in the UI, but we don't delete them, keeping old products intact.
  const hiddenCats = await prisma.category.updateMany({
    where: { id: { notIn: validCategoryIds } },
    data: { isActive: false }
  });
  console.log(`Deactivated ${hiddenCats.count} old categories.`);

  const hiddenSubs = await prisma.subcategory.updateMany({
    where: { id: { notIn: validSubcategoryIds } },
    data: { isActive: false }
  });
  console.log(`Deactivated ${hiddenSubs.count} old subcategories.`);

  console.log('Category structural fix complete!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
