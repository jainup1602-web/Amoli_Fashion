const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDuplicateSubcategories() {
  const allSubs = await prisma.subcategory.findMany({
    include: { product: true, category: true }
  });

  const activeSubs = allSubs.filter(s => s.isActive);
  const inactiveSubs = allSubs.filter(s => !s.isActive);

  console.log(`Found ${activeSubs.length} active and ${inactiveSubs.length} inactive subcategories.`);

  for (const inactive of inactiveSubs) {
    if (inactive.product.length > 0) {
      console.log(`Inactive subcategory "${inactive.name}" has ${inactive.product.length} products. Migrating...`);
      // Find a matching active subcategory in the same category
      // Match by name or slug closely
      const match = activeSubs.find(a => 
        a.category.id === inactive.category.id && 
        (a.name.toLowerCase() === inactive.name.toLowerCase() || 
         a.slug.replace(/-/g, '') === inactive.slug.replace(/-/g, ''))
      );

      if (match) {
        console.log(`  -> Migrating products to "${match.name}" (ID: ${match.id})`);
        for (const prod of inactive.product) {
          await prisma.product.update({
            where: { id: prod.id },
            data: { subcategoryId: match.id }
          });
        }
      } else {
        console.log(`  -> No exact match found for "${inactive.name}". Keeping it.`);
        continue; // skip deletion if we can't migrate
      }
    }

    try {
      await prisma.subcategory.delete({ where: { id: inactive.id } });
      console.log(`Deleted inactive subcategory: ${inactive.name}`);
    } catch (err) {
      console.error(`Failed to delete ${inactive.name}:`, err.message);
    }
  }
}

cleanDuplicateSubcategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
