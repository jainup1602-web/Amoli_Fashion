'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Menu, AlertCircle } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useState, useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B76E79]" />
      </div>
    );
  }

  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gray-50">
        <div className="w-16 h-16 bg-[#B76E79]/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-[#B76E79]" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 max-w-sm mb-6">
          {!isAuthenticated 
            ? 'Please login with your admin credentials to access the Atelier Dashboard.' 
            : 'Your account does not have administrator privileges.'}
        </p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('openLoginModal'))} 
          className="px-6 py-2.5 bg-[#B76E79] text-white rounded-lg font-medium shadow-sm hover:opacity-90 transition-opacity"
        >
          {isAuthenticated ? 'Switch Account' : 'Login to Admin'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50/30 overflow-x-hidden w-full">
      {/* Sidebar - fixed left, full height */}
      <AdminSidebar />

      {/* Main content - offset by sidebar width on desktop */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen max-w-full w-full overflow-x-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('openAdminSidebar'))}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-sm font-bold text-gray-900 tracking-tight uppercase">Atelier Management</span>
          <div className="w-10" />
        </div>

        <div className="p-4 sm:p-6 md:p-8 lg:p-10 flex-1">
          {children}
        </div>

        <footer className="bg-white border-t border-gray-100 py-6 px-4 md:px-8 lg:px-10 mt-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-xs font-medium text-gray-400 uppercase tracking-widest">
              <span>© {new Date().getFullYear()} Amoli Atelier</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>v2.4.0 Stable</span>
            </div>
            <div className="flex gap-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <a href="/admin" className="hover:text-[#B76E79] transition-colors">Dashboard</a>
              <a href="/admin/settings" className="hover:text-[#B76E79] transition-colors">System Status</a>
              <a href="/admin/reports" className="hover:text-[#B76E79] transition-colors">Analytics</a>
              <a href="mailto:support@amolijewelry.com" className="hover:text-[#B76E79] transition-colors">Technical Support</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
