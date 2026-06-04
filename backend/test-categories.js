const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    orderBy: { order: 'asc' }
  });
  console.log(cats.map(c => `${c.order}: ${c.name}`).join('\n'));
}

main().finally(() => prisma.$disconnect());
