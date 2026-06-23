import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your Account',
  description: 'Register at Amoli Fashion Jewellery. Create your account to shop premium demi-fine jewellery, track orders & save your wishlist.',
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
