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
  Plus,
  BarChart3,
  DollarSign,
  Activity,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const getToken = async () => {
  const { getAuthToken } = await import('@/lib/firebase-client');
  return await getAuthToken();
};

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
  averageOrderValue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
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

interface MonthlyData {
  month: string;
  year: number;
  revenue: number;
  orders: number;
}

interface BestSellingProduct {
  rank: number;
  productId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
  image: string | null;
  stock: number;
  price: number;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#3B82F6',
  processing: '#F59E0B',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
  pending: '#6B7280',
  returned: '#EC4899',
};

const PIE_COLORS = ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#6B7280', '#EC4899'];

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    averageOrderValue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<MonthlyData[]>([]);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState<Record<string, number>>({});
  const [bestSellingProducts, setBestSellingProducts] = useState<BestSellingProduct[]>([]);

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
      const token = await getToken();
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
          averageOrderValue: data.stats?.averageOrderValue || 0,
          monthlyRevenue: data.stats?.monthlyRevenue || 0,
          weeklyRevenue: data.stats?.weeklyRevenue || 0,
        });
        setLowStockProducts(data.lowStockProducts || []);
        setRecentOrders(data.recentOrders || []);
        setMonthlyRevenueData(data.monthlyRevenueData || []);
        setOrderStatusDistribution(data.orderStatusDistribution || {});
        setBestSellingProducts(data.bestSellingProducts || []);
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
      subtitle: `This month: ${formatPrice(stats.monthlyRevenue)}`,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    },
    {
      title: 'Total Orders',
      value: (stats.totalOrders || 0).toString(),
      icon: ShoppingCart,
      subtitle: `This week: ${formatPrice(stats.weeklyRevenue)}`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    },
    {
      title: 'Avg. Order Value',
      value: formatPrice(stats.averageOrderValue || 0),
      icon: TrendingUp,
      subtitle: `${stats.totalOrders} paid orders`,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      iconBg: 'bg-gradient-to-br from-violet-400 to-violet-600',
    },
    {
      title: 'Total Customers',
      value: (stats.totalUsers || 0).toString(),
      icon: User,
      subtitle: 'Registered accounts',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
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

  // Pie chart data
  const pieData = Object.entries(orderStatusDistribution).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: STATUS_COLORS[status] || '#6B7280',
  }));

  const totalStatusOrders = pieData.reduce((sum, d) => sum + d.value, 0);

  // Custom tooltip for area chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 shadow-xl rounded-xl border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-sm font-bold text-gray-900">{formatPrice(payload[0].value)}</p>
          {payload[1] && <p className="text-xs text-gray-500">{payload[1].value} orders</p>}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-gray-200 rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 bg-gray-100 rounded-2xl border border-gray-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-gray-50 rounded-2xl border border-gray-200" />
          <div className="h-96 bg-gray-50 rounded-2xl border border-gray-200" />
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
          <p className="text-sm text-gray-500 mt-1">Real-time overview of your store&apos;s performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">Live</span>
          </div>
          <span className="text-xs font-medium text-gray-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.subtitle}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue Chart + Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Last 12 months</span>
          </div>
          <div className="p-6">
            {monthlyRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B76E79" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#B76E79" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#B76E79"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#B76E79', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                No revenue data available yet.
              </div>
            )}
          </div>
        </Card>

        {/* Order Status Distribution */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Order Status</h2>
            </div>
          </div>
          <div className="p-6">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value} (${((value / totalStatusOrders) * 100).toFixed(1)}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-600 text-xs font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-900 text-xs">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No order data available.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Best Selling Products + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            </div>
            <Link href="/admin/orders" className="text-xs font-bold text-[#B76E79] hover:underline uppercase tracking-wider flex items-center">
              View All <ChevronRight className="h-3 w-3 ml-1" />
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
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => router.push(`/admin/orders/${order.id}`)}>
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

        {/* Best Selling Products */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Best Sellers</h2>
            </div>
            <Link href="/admin/reports/top-selling" className="text-xs font-bold text-[#B76E79] hover:underline uppercase tracking-wider">
              More
            </Link>
          </div>
          <div className="p-0">
            {bestSellingProducts.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {bestSellingProducts.map((product) => (
                  <div key={product.productId} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                      {product.rank}
                    </div>
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package className="h-4 w-4 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {product.totalSold} sold · {formatPrice(product.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">No sales data yet.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Low Stock Alert + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low Stock Alert */}
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">Inventory Alerts</h2>
              {lowStockProducts.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                  {lowStockProducts.length}
                </span>
              )}
            </div>
            <Link href="/admin/inventory" className="text-xs font-bold text-[#B76E79] hover:underline uppercase tracking-wider">
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
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${
                        product.stock === 0
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} Units`}
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

        {/* Quick Actions */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Add New Product', icon: Plus, href: '/admin/products/add', color: 'text-emerald-600' },
              { label: 'Manage Inventory', icon: Package, href: '/admin/inventory', color: 'text-blue-600' },
              { label: 'View Reports', icon: TrendingUp, href: '/admin/reports', color: 'text-violet-600' },
              { label: 'Settings', icon: Settings, href: '/admin/settings', color: 'text-gray-600' },
              { label: 'CMS Pages', icon: FileText, href: '/admin/cms-pages', color: 'text-amber-600' },
            ].map((action, i) => (
              <Link key={i} href={action.href} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all group">
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
                <ChevronRight className="h-3 w-3 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
