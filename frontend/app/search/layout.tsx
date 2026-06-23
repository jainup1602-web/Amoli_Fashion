import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amolifashion.com';

export const metadata: Metadata = {
  title: 'Search Jewellery',
  description:
    'Search through Amoli Fashion Jewellery's entire collection. Find necklaces, earrings, bracelets, rings, bangles & more by name, material, occasion or category.',
  alternates: { canonical: `${baseUrl}/search` },
  robots: { index: false, follow: true }, // search pages should not be indexed
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
