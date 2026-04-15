'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Package, IndianRupee, ShoppingBag, Download } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

interface TopProduct {
  rank: number;
  productId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
  orderCount: number;
  image: string | null;
  slug: string;
  stock: number;
  price: number;
}

const PERIODS = [
  { label: 'All Time', value: 'all' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
];

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function TopSellingPage() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalUnitsSold: 0 });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [limit, setLimit] = useState(10);
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => { fetchReport(); }, [period, limit]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/reports/top-selling?period=${period}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Rank', 'Product', 'Units Sold', 'Orders', 'Revenue', 'Stock'];
    const rows = products.map(p => [p.rank, `"${p.name}"`, p.totalSold, p.orderCount, p.totalRevenue, p.stock]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top-selling-${period}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-6">
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1 block">Reports</span>
          <h1 className="text-2xl font-serif text-[#1C1C1C] flex items-center gap-2">
            <TrendingUp className="h-6 w-6" style={{ color: '#B76E79' }} />
            Top Selling Products
          </h1>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-widest uppercase border transition-colors"
          style={{ borderColor: '#B76E79', color: '#B76E79' }}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="px-3 py-1.5 text-xs font-elegant tracking-widest uppercase border transition-colors"
              style={{
                borderColor: '#B76E79',
                backgroundColor: period === p.value ? '#B76E79' : 'transparent',
                color: period === p.value ? '#fff' : '#B76E79',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <select
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          className="text-xs font-elegant tracking-widest uppercase border px-2 py-1.5 outline-none cursor-pointer"
          style={{ borderColor: '#B76E79', color: '#B76E79', backgroundColor: 'transparent' }}
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: formatPrice(summary.totalRevenue), icon: IndianRupee },
          { label: 'Units Sold', value: summary.totalUnitsSold.toLocaleString(), icon: Package },
          { label: 'Products Listed', value: products.length, icon: ShoppingBag },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-gray-50 border border-gold/10 p-4 rounded-none">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4" style={{ color: '#B76E79' }} />
              <span className="text-[10px] tracking-widest uppercase text-gray-400">{label}</span>
            </div>
            <p className="text-xl font-serif text-[#1C1C1C]">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gold/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#B76E79' }} />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No sales data found for this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-medium w-12">#</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-medium">Product</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-medium">Units Sold</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-medium">Orders</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-medium">Revenue</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.productId} className="border-b border-gray-50 hover:bg-[#FDFBF7] transition-colors">
                    {/* Rank */}
                    <td className="px-4 py-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{
                          backgroundColor: i < 3 ? '#B76E79' : '#f3f4f6',
                          color: i < 3 ? '#fff' : '#6b7280',
                        }}
                      >
                        {p.rank}
                      </span>
                    </td>
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[#1C1C1C] line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400">{formatPrice(p.price)}</p>
                        </div>
                      </div>
                    </td>
                    {/* Units */}
                    <td className="px-4 py-3 text-right font-medium text-[#1C1C1C]">{p.totalSold}</td>
                    {/* Orders */}
                    <td className="px-4 py-3 text-right text-gray-600">{p.orderCount}</td>
                    {/* Revenue */}
                    <td className="px-4 py-3 text-right font-medium" style={{ color: '#B76E79' }}>
                      {formatPrice(p.totalRevenue)}
                    </td>
                    {/* Stock */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className="text-xs px-2 py-0.5 font-medium"
                        style={{
                          backgroundColor: p.stock === 0 ? '#fee2e2' : p.stock < 10 ? '#fef3c7' : '#dcfce7',
                          color: p.stock === 0 ? '#dc2626' : p.stock < 10 ? '#d97706' : '#16a34a',
                        }}
                      >
                        {p.stock === 0 ? 'Out' : p.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
