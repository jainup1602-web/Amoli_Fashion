import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Header } from '@/components/layout/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Site Header at Top */}
      <Header />
      
      {/* Main Content Wrapper - Row with Sidebar and Dashboard */}
      <div className="flex flex-1">
        {/* Sidebar - Left Side */}
        <AdminSidebar />
        
        {/* Dashboard Content - Right Side */}
        <main className="flex-1 lg:ml-64 bg-[#FDFBF7] flex flex-col min-h-[calc(100vh-136px)]">
          <div className="p-4 md:p-8 lg:p-10 flex-1">
            {children}
          </div>
          
          {/* Footer inside dashboard - Responsive */}
          <footer className="bg-gray-50 border-t border-gray-200 py-6 px-4 md:px-8 lg:px-10 mt-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-sm text-gray-600">
                  © {new Date().getFullYear()} Amoli Fashion Jewellery. All rights reserved.
                </div>
                <div className="flex space-x-6 text-sm text-gray-600">
                  <a href="/privacy" className="hover:text-amber-600 transition">Privacy Policy</a>
                  <a href="/terms" className="hover:text-amber-600 transition">Terms of Service</a>
                  <a href="/contact" className="hover:text-amber-600 transition">Contact</a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
