import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amolifashion.com';

export const metadata: Metadata = {
  title: 'Size Guide – Find Your Perfect Fit',
  description:
    'Use our jewellery size guide to find the perfect fit for rings, bracelets, bangles & necklaces. Accurate sizing chart for Indian jewellery sizes. Shop with confidence at Amoli Fashion Jewellery.',
  keywords: [
    // Page Specific
    'jewellery size guide', 'ring size chart India', 'bangle size guide',
    'bracelet size chart', 'necklace length guide', 'how to measure ring size',
    'Indian jewellery sizing', 'how to measure bangle size at home', 'standard necklace lengths',
    'choker size guide', 'how to find ring size without measuring tape', 'Amoli size guide',
    'adjustable ring sizing', 'bracelet measurement guide', 'women bangle sizes India',
    'online jewellery sizing', 'how to check ring size', 'bangle measurement in inches',
    'necklace chain length chart',
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
  alternates: { canonical: `${baseUrl}/size-guide` },
};

export default function SizeGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
