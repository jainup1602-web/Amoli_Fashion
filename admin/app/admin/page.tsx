'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  User,
  ShoppingCart,
  CreditCard,
  Package,
  AlertCircle
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
      title: 'Total Users',
      value: (stats.totalUsers || 0).toString(),
      icon: User,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: (stats.totalOrders || 0).toString(),
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue || 0),
      icon: CreditCard,
      color: 'bg-yellow-500',
    },
    {
      title: 'Low Stock Items',
      value: (stats.lowStockCount || 0).toString(),
      icon: AlertCircle,
      color: 'bg-red-500',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'processing':
      case 'confirmed':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4" style={{ borderColor: '#B76E79' }} />
          <p className="text-xs tracking-widest uppercase text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Please login to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gold/20 pb-6">
        <div>
          <span className="text-gold tracking-[0.2em] text-xs uppercase mb-2 block font-elegant">Overview</span>
          <h1 className="text-3xl font-serif text-[#1C1C1C]">Atelier Dashboard</h1>
        </div>
        <p className="text-gray-500 mt-4 md:mt-0 font-light tracking-wide text-sm">Welcome back. Here&apos;s today&apos;s summary.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6 border border-gold/10 shadow-sm rounded-none bg-gray-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 font-elegant tracking-widest uppercase mb-2">{stat.title}</p>
                <p className="text-3xl font-serif text-[#1C1C1C]">{stat.value}</p>
              </div>
              <div className={`p-4 bg-[#FDFBF7] border border-gold/20`}>
                <stat.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="p-8 border border-gold/10 shadow-sm rounded-none bg-gray-50">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gold/20">
            <h2 className="text-xl font-serif text-[#1C1C1C]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-elegant tracking-widest uppercase text-gold hover:text-gold/80 transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-0">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 group hover:bg-[#FDFBF7] px-2 -mx-2 transition-colors">
                  <div>
                    <p className="font-medium text-[#1C1C1C] tracking-wide">{order.orderNumber || `#${order.id.slice(-8)}`}</p>
                    <p className="text-xs text-gray-500 mt-1 font-light">
                      {order.userId?.displayName || order.userId?.email || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="font-medium text-[#1C1C1C]">{formatPrice(order.total)}</p>
                    <span className={`text-[10px] px-2 py-0.5 uppercase tracking-widest mt-1 font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 font-light text-center py-8 italic text-sm">No orders yet</p>
            )}
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card className="p-8 border border-gold/10 shadow-sm rounded-none bg-gray-50">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gold/20">
            <h2 className="text-xl font-serif text-[#1C1C1C]">Low Stock Alert</h2>
            <Link href="/admin/products" className="text-xs font-elegant tracking-widest uppercase text-gold hover:text-gold/80 transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-0">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 group hover:bg-[#FDFBF7] px-2 -mx-2 transition-colors">
                  <div>
                    <p className="font-medium text-[#1C1C1C] tracking-wide line-clamp-1">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-1 font-elegant tracking-widest uppercase">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right pl-4">
                    <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-3 py-1 whitespace-nowrap">{product.stock} left</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 font-light text-center py-8 italic text-sm">All products fully stocked</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
