import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function MainSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FDFBF7] text-[#1C1C1C] flex flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}
