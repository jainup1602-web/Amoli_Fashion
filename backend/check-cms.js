const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCMS() {
  const pages = await prisma.cmspage.findMany();
  let updatedCount = 0;

  for (const page of pages) {
    let content = page.content;
    let title = page.title;
    
    // Replace names
    const regexList = [/prao/gi, /amali/gi];
    let needsUpdate = false;
    
    for (const regex of regexList) {
      if (regex.test(content) || regex.test(title)) {
        needsUpdate = true;
        content = content.replace(regex, 'Amoli Fashion Jewellery');
        title = title.replace(regex, 'Amoli Fashion Jewellery');
      }
    }

    if (needsUpdate) {
      await prisma.cmspage.update({
        where: { id: page.id },
        data: { content, title }
      });
      console.log(`Updated CMS page: ${page.slug}`);
      updatedCount++;
    }
  }
  
  console.log(`Finished updating CMS pages. Total updated: ${updatedCount}`);
}

checkCMS()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
