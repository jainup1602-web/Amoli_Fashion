const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const cat = await prisma.category.findFirst({ where: { slug: 'earrings' }});
  const subs = await prisma.subcategory.findMany({ where: { categoryId: cat.id }});
  console.log(subs.map(s => ({ name: s.name, isActive: s.isActive, slug: s.slug })));
}

check().finally(() => prisma.$disconnect());
