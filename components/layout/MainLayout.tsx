import { Header } from './Header';
import { Footer } from './Footer';

export function MainLayout({ children }: { children: React.ReactNode }) {
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
