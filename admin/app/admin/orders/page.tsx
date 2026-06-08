'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  Eye, Search, Package, Clock, Truck, CheckCircle, XCircle, AlertCircle,
  ChevronLeft, ChevronRight, Download, Filter
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const STATUS_TABS = [
  { key: 'all', label: 'All Orders', icon: Package, color: 'text-gray-600 border-gray-300 bg-gray-50' },
  { key: 'confirmed', label: 'New', icon: Clock, color: 'text-blue-600 border-blue-300 bg-blue-50' },
  { key: 'processing', label: 'Processing', icon: AlertCircle, color: 'text-amber-600 border-amber-300 bg-amber-50' },
  { key: 'shipped', label: 'Shipped', icon: Truck, color: 'text-purple-600 border-purple-300 bg-purple-50' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'text-emerald-600 border-emerald-300 bg-emerald-50' },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-rose-600 border-rose-300 bg-rose-50' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 20 });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      if (!token) { setLoading(false); return; }

      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (activeTab !== 'all') params.set('status', activeTab);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination || { total: data.orders.length, pages: 1, page: 1, limit: 20 });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, searchTerm]);

  // Fetch status counts for badges
  const fetchStatusCounts = useCallback(async () => {
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      if (!token) return;

      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.orderStatusDistribution) {
        setStatusCounts(data.orderStatusDistribution);
      }
    } catch (err) {
      console.error('Error fetching status counts:', err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  // Reset page when tab or search changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPaymentColor = (status: string) => {
    return status === 'paid'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const totalAllOrders = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[#B76E79] tracking-[0.2em] text-xs uppercase mb-2 block font-medium">Transactions</span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders Management</h1>
        </div>
        <p className="text-gray-500 text-sm">View and manage all customer orders</p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const count = tab.key === 'all' ? totalAllOrders : (statusCounts[tab.key] || 0);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                isActive
                  ? 'bg-[#B76E79] text-white border-[#B76E79] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full min-w-[20px] text-center ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <Card className="p-4 border border-gray-100 shadow-sm rounded-2xl bg-white">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79]/20 outline-none text-sm transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="font-medium">{pagination.total} orders</span>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="loading-jewelry mx-auto mb-4" />
            <p className="text-sm text-gray-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm">No orders found</p>
            {searchTerm && <p className="text-gray-400 text-xs mt-1">Try a different search term</p>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100">
                    <th className="py-4 px-6 font-bold">Order</th>
                    <th className="py-4 px-6 font-bold">Customer</th>
                    <th className="py-4 px-6 font-bold">Date</th>
                    <th className="py-4 px-6 font-bold">Amount</th>
                    <th className="py-4 px-6 font-bold text-center">Status</th>
                    <th className="py-4 px-6 font-bold text-center">Payment</th>
                    <th className="py-4 px-6 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {order.orderNumber || order.orderId}
                          </span>
                          {order.isGift && (
                            <span className="text-[9px] px-1.5 py-0.5 font-bold tracking-widest uppercase text-white rounded-md bg-[#B76E79]">
                              🎁 Gift
                            </span>
                          )}
                        </div>
                        {order.shiprocketOrderId && (
                          <span className="text-[10px] text-gray-400 block mt-0.5">SR: {order.shiprocketOrderId}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.customerName || order.userId?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{order.customerEmail || order.userId?.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-gray-900">{formatPrice(order.total || order.totalAmount || 0)}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.orderStatus || order.status)}`}>
                          {order.orderStatus || order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPaymentColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#B76E79] bg-[#B76E79]/5 border border-[#B76E79]/20 rounded-lg hover:bg-[#B76E79]/10 transition-colors">
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-500">
                  Page {pagination.page} of {pagination.pages} · {pagination.total} total orders
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-[#B76E79] text-white shadow-sm'
                            : 'text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
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
