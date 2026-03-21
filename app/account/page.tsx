'use client';

import { useState, useEffect } from 'react';
import { Package, User, MapPin, Heart, Settings, Bell, LogOut, ChevronRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

// Sub-page imports
import dynamic from 'next/dynamic';

const ProfilePage = dynamic(() => import('./profile/page'), { ssr: false });
const OrdersPage = dynamic(() => import('./orders/page'), { ssr: false });
const AddressesPage = dynamic(() => import('./addresses/page'), { ssr: false });
const WishlistPage = dynamic(() => import('./wishlist/page'), { ssr: false });
const NotificationsPage = dynamic(() => import('./notifications/page'), { ssr: false });
const SettingsPage = dynamic(() => import('./settings/page'), { ssr: false });

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('openLoginModal'));
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    try {
      localStorage.setItem('manualLogout', 'true');
      localStorage.removeItem('token');
      dispatch(logout());
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      if (auth) await signOut(auth);
      router.push('/');
    } catch {
      dispatch(logout());
      router.push('/');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfilePage />;
      case 'orders': return <OrdersPage />;
      case 'addresses': return <AddressesPage />;
      case 'wishlist': return <WishlistPage />;
      case 'notifications': return <NotificationsPage />;
      case 'settings': return <SettingsPage />;
      default: return <ProfilePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F5F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">

          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-64 flex-shrink-0">
            <div className="bg-white border border-gray-100">
              {/* User info */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ backgroundColor: '#B76E79' }}>
                    {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-[#1C1C1C] truncate">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email || user?.phoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Nav items */}
              <nav className="py-2">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-colors ${
                      activeTab === id
                        ? 'text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#B76E79]'
                    }`}
                    style={activeTab === id ? { backgroundColor: '#B76E79' } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="font-elegant tracking-wide">{label}</span>
                    </div>
                    {activeTab === id && <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                ))}

                {/* Logout */}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    <span className="font-elegant tracking-wide">Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Mobile tab bar */}
          <div className="md:hidden w-full mb-4">
            <div className="flex overflow-x-auto gap-2 pb-2">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-elegant tracking-widest uppercase border transition-colors ${
                    activeTab === id ? 'text-white border-[#B76E79]' : 'text-gray-500 border-gray-200'
                  }`}
                  style={activeTab === id ? { backgroundColor: '#B76E79' } : {}}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
