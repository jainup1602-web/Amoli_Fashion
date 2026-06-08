'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import {
  Package, Search, AlertTriangle, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, ArrowUpDown, Save, X, Edit2
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { alertSuccess, alertError } from '@/lib/alert';

const FILTER_TABS = [
  { key: 'all', label: 'All Products', icon: Package, color: 'text-gray-600' },
  { key: 'healthy', label: 'In Stock', icon: CheckCircle, color: 'text-emerald-600' },
  { key: 'low', label: 'Low Stock', icon: AlertTriangle, color: 'text-amber-600' },
  { key: 'out', label: 'Out of Stock', icon: XCircle, color: 'text-rose-600' },
];

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sort, setSort] = useState('stock_asc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 50 });
  const [summary, setSummary] = useState({ total: 0, lowStock: 0, outOfStock: 0, healthy: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchInventory = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      if (!token) { if (!silent) setLoading(false); return; }

      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '50');
      if (activeFilter !== 'all') params.set('filter', activeFilter);
      if (searchTerm) params.set('search', searchTerm);
      if (sort) params.set('sort', sort);

      const res = await fetch(`/api/admin/inventory?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setPagination(data.pagination || { total: 0, pages: 1, page: 1, limit: 50 });
        setSummary(data.summary || { total: 0, lowStock: 0, outOfStock: 0, healthy: 0 });
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, activeFilter, searchTerm, sort]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, searchTerm, sort]);

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setEditStock(product.stock.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStock('');
  };

  const saveStock = async (productId: string) => {
    if (editStock === '' || isNaN(parseInt(editStock))) {
      alertError('Please enter a valid stock number');
      return;
    }
    setSaving(true);
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      if (!token) { alertError('Please login first'); return; }

      const res = await fetch(`/api/admin/inventory/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stock: parseInt(editStock) }),
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess(`Stock updated to ${editStock}`);
        setEditingId(null);
        // Optimistically update products immediately so UI reacts instantly
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: parseInt(editStock) } : p));
        // Silent fetch to sync other data/summary without flashing
        fetchInventory(true);
      } else {
        alertError(data.error || 'Failed to update stock');
      }
    } catch (error) {
      alertError('Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock <= 0) return { text: 'Out of Stock', class: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (stock <= 5) return { text: `${stock} left`, class: 'bg-red-50 text-red-700 border-red-200' };
    if (stock <= 10) return { text: `${stock} units`, class: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { text: `${stock} units`, class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const getStockBarWidth = (stock: number) => {
    const max = 100;
    return Math.min((stock / max) * 100, 100);
  };

  const getStockBarColor = (stock: number) => {
    if (stock <= 0) return 'bg-rose-500';
    if (stock <= 5) return 'bg-red-500';
    if (stock <= 10) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[#B76E79] tracking-[0.2em] text-xs uppercase mb-2 block font-medium">Stock Control</span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Management</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: summary.total, icon: Package, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
          { label: 'In Stock', value: summary.healthy, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Low Stock', value: summary.lowStock, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Out of Stock', value: summary.outOfStock, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
        ].map((item, i) => (
          <Card key={i} className={`p-4 border rounded-2xl ${item.bg}`}>
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500 font-medium">{item.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const count = tab.key === 'all' ? summary.total
            : tab.key === 'healthy' ? summary.healthy
            : tab.key === 'low' ? summary.lowStock
            : summary.outOfStock;
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                isActive
                  ? 'bg-[#B76E79] text-white border-[#B76E79] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${isActive ? 'text-white' : tab.color}`} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full min-w-[20px] text-center ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Sort */}
      <Card className="p-4 border border-gray-100 shadow-sm rounded-2xl bg-white">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79]/20 outline-none text-sm transition-colors"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-[#B76E79] outline-none transition-colors"
          >
            <option value="stock_asc">Stock: Low → High</option>
            <option value="stock_desc">Stock: High → Low</option>
            <option value="name_asc">Name: A → Z</option>
            <option value="name_desc">Name: Z → A</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="loading-jewelry mx-auto mb-4" />
            <p className="text-sm text-gray-400">Loading inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100">
                    <th className="py-4 px-6 font-bold">Product</th>
                    <th className="py-4 px-6 font-bold">SKU</th>
                    <th className="py-4 px-6 font-bold">Category</th>
                    <th className="py-4 px-6 font-bold">Price</th>
                    <th className="py-4 px-6 font-bold">Stock Level</th>
                    <th className="py-4 px-6 font-bold text-center">Status</th>
                    <th className="py-4 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => {
                    const badge = getStockBadge(product.stock);
                    const isEditing = editingId === product.id;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                <Package className="h-4 w-4 text-gray-300" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs text-gray-500 font-mono">{product.sku || '—'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs text-gray-500">{product.category?.name || '—'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(product.specialPrice || product.originalPrice)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={editStock}
                                onChange={(e) => setEditStock(e.target.value)}
                                className="w-20 px-3 py-1.5 border border-[#B76E79] rounded-lg text-sm font-medium focus:ring-1 focus:ring-[#B76E79]/20 outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveStock(product.id);
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-32">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-gray-900">{product.stock}</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${getStockBarColor(product.stock)}`}
                                  style={{ width: `${getStockBarWidth(product.stock)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.class}`}>
                            {badge.text}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => saveStock(product.id)}
                                disabled={saving}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(product)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#B76E79] bg-[#B76E79]/5 border border-[#B76E79]/20 rounded-lg hover:bg-[#B76E79]/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Edit2 className="h-3 w-3" />
                              Update
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-500">
                  Page {pagination.page} of {pagination.pages} · {pagination.total} products
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page >= pagination.pages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
