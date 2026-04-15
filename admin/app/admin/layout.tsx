import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#FDFBF7]">
      {/* Sidebar - fixed left, full height */}
      <AdminSidebar />

      {/* Main content - offset by sidebar width on desktop */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          {/* Spacer for hamburger button (fixed positioned) */}
          <div className="w-10" />
          <span className="text-sm font-semibold text-gray-800 tracking-wide">Admin Panel</span>
          <div className="w-10" />
        </div>

        <div className="p-3 sm:p-4 md:p-8 lg:p-10 flex-1">
          {children}
        </div>

        <footer className="bg-gray-50 border-t border-gray-200 py-6 px-4 md:px-8 lg:px-10 mt-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Amoli Fashion Jewellery. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="/privacy" className="hover:text-[#B76E79] transition">Privacy Policy</a>
              <a href="/terms" className="hover:text-[#B76E79] transition">Terms of Service</a>
              <a href="/contact" className="hover:text-[#B76E79] transition">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
