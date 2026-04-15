const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const notifs = await prisma.notification.findMany({ where: { link: { not: null } } });
  let fixed = 0;
  for (const n of notifs) {
    if (n.link && /^["'\[]/.test(n.link)) {
      const clean = n.link.replace(/^["'\[]+|["'\]]+$/g, '');
      await prisma.notification.update({ where: { id: n.id }, data: { link: clean } });
      fixed++;
      console.log(`Fixed: "${n.link}" -> "${clean}"`);
    }
  }
  console.log('Done. Fixed', fixed, 'notifications.');
  await prisma.$disconnect();
}

fix().catch(console.error);
