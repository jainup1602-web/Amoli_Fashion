const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.cmspage.findMany()
  .then(r => console.log('Count:', r.length, JSON.stringify(r.map(x => x.slug))))
  .catch(console.error)
  .finally(() => p.$disconnect());
