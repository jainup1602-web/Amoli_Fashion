import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login to Your Account',
  description: 'Log in to your Amoli Fashion Jewellery account to track orders, manage wishlist & more.',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
