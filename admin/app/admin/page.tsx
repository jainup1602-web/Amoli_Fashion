'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  User,
  ShoppingCart,
  CreditCard,
  Package,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  Settings,
  FileText,
  Plus
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  userId: {
    displayName?: string;
    email?: string;
  };
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }

      const response = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalUsers: data.stats?.totalUsers || 0,
          totalOrders: data.stats?.totalOrders || 0,
          totalRevenue: data.stats?.totalRevenue || 0,
          lowStockCount: data.stats?.lowStockCount || 0,
        });
        setLowStockProducts(data.lowStockProducts || []);
        setRecentOrders(data.recentOrders || []);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue || 0),
      icon: CreditCard,
      trend: '+12.5%',
      trendUp: true,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Total Orders',
      value: (stats.totalOrders || 0).toString(),
      icon: ShoppingCart,
      trend: '+5.2%',
      trendUp: true,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Total Users',
      value: (stats.totalUsers || 0).toString(),
      icon: User,
      trend: '+2.1%',
      trendUp: true,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Low Stock',
      value: (stats.lowStockCount || 0).toString(),
      icon: AlertCircle,
      trend: 'Warning',
      trendUp: false,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
  ];

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'completed' || s === 'delivered') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s === 'processing' || s === 'confirmed') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (s === 'shipped') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s === 'cancelled') return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-gray-200 rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl border border-gray-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-50 rounded-xl border border-gray-200" />
          <div className="h-96 bg-gray-50 rounded-xl border border-gray-200" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-[#B76E79]/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-[#B76E79]" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 max-w-sm mb-6">Please login with your admin credentials to access the Atelier Dashboard.</p>
        <button onClick={() => window.dispatchEvent(new CustomEvent('openLoginModal'))} className="px-6 py-2.5 bg-[#B76E79] text-white rounded-lg font-medium shadow-sm hover:opacity-90 transition-opacity">
          Login to Admin
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Atelier Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time overview of your store's performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                <User className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
          <span className="text-xs font-medium text-gray-400">3 admins online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6 border border-gray-100 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-amber-500 mr-1" />
                  )}
                  <span className={`text-xs font-semibold ${stat.trendUp ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {stat.trend}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-1.5 uppercase font-medium">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-xl bg-white overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            </div>
            <Link href="/admin/orders" className="text-xs font-bold text-[#B76E79] hover:underline uppercase tracking-wider flex items-center">
              Full List <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-50">
                  <th className="px-6 py-3 font-bold">Order ID</th>
                  <th className="px-6 py-3 font-bold">Customer</th>
                  <th className="px-6 py-3 font-bold">Amount</th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">#{order.orderNumber || order.id.slice(-6).toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">{order.userId?.displayName || 'Guest User'}</span>
                          <span className="text-[10px] text-gray-400 lowercase">{order.userId?.email || 'no email'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">{formatPrice(order.total || 0)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400 italic">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card className="border border-gray-100 shadow-sm rounded-xl bg-white overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">Inventory Alert</h2>
            </div>
            <Link href="/admin/products" className="text-xs font-bold text-[#B76E79] hover:underline uppercase tracking-wider">
              Manage
            </Link>
          </div>
          <div className="p-0">
            {lowStockProducts.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">SKU: {product.sku}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded border border-amber-100">
                        {product.stock} Units
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm text-gray-500">All products are well stocked.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions / System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Add New Product', icon: Plus, href: '/admin/products/add' },
          { label: 'View Reports', icon: TrendingUp, href: '/admin/reports' },
          { label: 'Settings', icon: Settings, href: '/admin/settings' },
          { label: 'CMS Pages', icon: FileText, href: '/admin/cms-pages' },
        ].map((action, i) => (
          <Link key={i} href={action.href} className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-white border border-gray-100 rounded-xl transition-all group">
            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
              <action.icon className="h-4 w-4 text-gray-400 group-hover:text-[#B76E79]" />
            </div>
            <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
