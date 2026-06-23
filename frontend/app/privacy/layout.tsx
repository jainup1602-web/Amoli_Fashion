import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amolifashion.com';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Read the privacy policy of Amoli Fashion Jewellery. Learn how we collect, use & protect your personal data when you shop jewellery online with us.',
  alternates: { canonical: `${baseUrl}/privacy` },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
