import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amolifashion.com';

export const metadata: Metadata = {
  title: 'Return & Refund Policy',
  description:
    'Read our easy return & refund policy at Amoli Fashion Jewellery. Hassle-free returns, quick refunds. We want you to shop with complete confidence.',
  keywords: [
    // Page Specific
    'Amoli return policy', 'jewellery return India', 'fashion jewellery refund',
    'easy returns jewellery', 'jewellery exchange policy', 'how to return jewellery',
    'damaged jewellery replacement', 'Amoli refund process', 'imitation jewellery return',
    'artificial jewellery exchange', 'can I return earrings', 'refund timeline Amoli',
    'jewellery return terms', 'return defective jewellery', 'Amoli cancellation policy',
    'cancel jewellery order', 'money back guarantee jewellery',
    // Brand & General
    "Amoli Fashion Jewellery", "Amoli jewellery", "Amoli jewellery online", "fashion jewellery online India", "demi-fine jewellery India", "artificial jewellery online", "imitation jewellery online", "brass jewellery online", "stainless steel jewellery online", "nickel-free jewellery", "skin-friendly jewellery", "anti-tarnish jewellery", "hypoallergenic jewellery India", "premium artificial jewellery online", "buy imitation jewellery online", "online jewellery store India", "best artificial jewellery brand online", "online fashion jewellery boutique", "Indian demi-fine jewellery online",
    // Categories
    "necklace set online", "earrings online India", "bracelets for women online", "rings online India", "bangles online shopping", "pendant set online", "anklet online India", "mangalsutra online", "choker necklace online", "layered necklace India", "jhumka earrings online", "stud earrings online", "hoop earrings online", "drop earrings online India", "kada bangle online", "adjustable bracelet online", "statement ring online India", "payal online shopping", "nose pin online", "maang tikka online", "bridal set online",
    // Occasion & Gifting
    "wedding jewellery online", "bridal jewellery set online", "party wear jewellery online", "daily wear jewellery online", "office wear jewellery online", "ethnic jewellery online", "western jewellery online", "festival jewellery online", "jewellery gift for wife online", "jewellery gift for girlfriend online", "send birthday jewellery gift online", "anniversary jewellery gift delivery", "valentines day jewellery gift online",
    // Location-based Online Delivery
    "buy jewellery online Jaipur", "jewellery delivery Jaipur", "fashion jewellery online Rajasthan", "buy jewellery online Ajmer", "jewellery delivery Ajmer", "buy jewellery online Beawar", "jewellery delivery Beawar", "Rajasthani jewellery online delivery", "handcrafted jewellery online Jaipur", "artificial jewellery online Jaipur", "buy jewellery online Jodhpur", "buy jewellery online Udaipur", "jewellery delivery Delhi", "fashion jewellery online Mumbai", "jewellery delivery Bangalore", "jewellery delivery Hyderabad", "jewellery delivery Pune", "jewellery delivery Ahmedabad", "jewellery delivery Chennai", "jewellery delivery Kolkata", "jewellery delivery all over India", "online jewellery delivery Rajasthan",
    // Intent
    "buy jewellery online India", "best fashion jewellery online India", "affordable jewellery online", "jewellery under 500 online", "jewellery under 1000 online", "jewellery under 2000 online", "cheap jewellery online India", "budget jewellery online India", "value for money jewellery online", "women jewellery online shopping", "latest jewellery designs 2025 online", "trendy jewellery online", "bestseller jewellery online India", "top rated jewellery online", "free shipping jewellery India", "cash on delivery jewellery online", "COD jewellery online India"
  ],
  alternates: { canonical: `${baseUrl}/return-policy` },
};

export default function ReturnPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
