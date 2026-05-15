const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Privacy Policy slug
  await prisma.cmspage.updateMany({
    where: { slug: 'privacy-policy' },
    data: { slug: 'privacy' }
  });

  // Update Terms & Conditions slug
  await prisma.cmspage.updateMany({
    where: { slug: 'terms-and-conditions' },
    data: { slug: 'terms' }
  });

  console.log('Slugs updated successfully');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
