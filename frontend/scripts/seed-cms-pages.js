const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pages = [
  {
    slug: 'about',
    title: 'About Us',
    content: `<h2>About Amoli</h2><p>Amoli is a premium jewelry brand dedicated to crafting exquisite pieces that celebrate life's most precious moments. Our collection blends traditional craftsmanship with contemporary design.</p><h3>Our Story</h3><p>Founded with a passion for fine jewelry, Amoli brings you handcrafted pieces made with the finest materials. Every piece tells a story of elegance and artistry.</p><h3>Our Promise</h3><p>We are committed to quality, authenticity, and customer satisfaction. Each piece is carefully crafted and quality-checked before reaching you.</p>`,
    metaTitle: 'About Us - Amoli Fashion Jewellery',
    metaDescription: 'Learn about Amoli Fashion Jewellery, a premium fashion brand dedicated to crafting exquisite pieces.',
    isActive: true,
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: `<h2>Privacy Policy</h2><p>Last updated: January 2025</p><p>At Amoli, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.</p><h3>Information We Collect</h3><p>We collect information you provide directly to us, such as your name, email address, shipping address, and payment information when you make a purchase.</p><h3>How We Use Your Information</h3><p>We use your information to process orders, send order confirmations, provide customer support, and send promotional communications (with your consent).</p><h3>Data Security</h3><p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or disclosure.</p>`,
    metaTitle: 'Privacy Policy - Amoli Fashion Jewellery',
    metaDescription: 'Read our privacy policy to understand how we collect and use your information.',
    isActive: true,
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    content: `<h2>Terms & Conditions</h2><p>Last updated: January 2025</p><p>By using our website and purchasing our products, you agree to these terms and conditions.</p><h3>Orders & Payments</h3><p>All orders are subject to availability. We accept major credit cards and UPI payments. Prices are in Indian Rupees (INR) and include applicable taxes.</p><h3>Shipping</h3><p>We ship across India. Delivery times vary by location. Free shipping on orders above ₹999.</p><h3>Returns & Exchanges</h3><p>We accept returns within 7 days of delivery for unused items in original packaging. Custom orders are non-returnable.</p>`,
    metaTitle: 'Terms & Conditions - Amoli Fashion Jewellery',
    metaDescription: 'Read our terms and conditions for purchasing from Amoli Fashion Jewellery.',
    isActive: true,
  },
  {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    content: `<h2>Frequently Asked Questions</h2><h3>What materials are used in your jewelry?</h3><p>We use high-quality materials including sterling silver, gold-plated brass, and genuine gemstones. Each product listing specifies the exact materials used.</p><h3>How do I care for my jewelry?</h3><p>Store your jewelry in a cool, dry place. Avoid contact with water, perfumes, and chemicals. Clean gently with a soft cloth.</p><h3>Do you offer customization?</h3><p>Yes! We offer customization on select pieces. Contact us for details.</p><h3>What is your return policy?</h3><p>We accept returns within 7 days of delivery for unused items in original packaging. Please contact our support team to initiate a return.</p><h3>How long does shipping take?</h3><p>Standard delivery takes 5-7 business days. Express delivery is available for select locations.</p>`,
    metaTitle: 'FAQ - Amoli Fashion Jewellery',
    metaDescription: 'Find answers to frequently asked questions about Amoli Fashion Jewellery.',
    isActive: true,
  },
];

async function main() {
  console.log('Seeding CMS pages...');
  for (const page of pages) {
    await prisma.cmspage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
    console.log(`✓ ${page.title}`);
  }
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
