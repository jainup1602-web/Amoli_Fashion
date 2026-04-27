'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Eye, Search } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Get fresh token from Firebase
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();

      if (!token) {
        console.error('No token available');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gold/20 pb-6">
        <div>
          <span className="text-gold tracking-[0.2em] text-xs uppercase mb-2 block font-elegant">Transactions</span>
          <h1 className="text-3xl font-serif text-[#1C1C1C]">Orders Management</h1>
        </div>
        <p className="text-gray-500 mt-4 md:mt-0 font-light tracking-wide text-sm">View and manage all customer orders</p>
      </div>

      <Card className="p-8 border border-gold/10 shadow-sm rounded-none bg-gray-50">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 border-b border-gold/10 pb-6">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#FDFBF7] border border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold outline-none font-light transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-6 py-3 bg-[#FDFBF7] border border-gold/30 focus:border-gold outline-none font-elegant tracking-widest text-xs uppercase text-[#1C1C1C] cursor-pointer appearance-none transition-colors"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gold/20 text-xs font-elegant tracking-widest uppercase text-gray-500">
                  <th className="py-4 px-4 font-normal">Order ID</th>
                  <th className="py-4 px-4 font-normal">Customer</th>
                  <th className="py-4 px-4 font-normal">Date</th>
                  <th className="py-4 px-4 font-normal">Total</th>
                  <th className="py-4 px-4 font-normal">Status</th>
                  <th className="py-4 px-4 font-normal">Payment</th>
                  <th className="py-4 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FDFBF7] transition-colors group">
                    <td className="py-4 px-4 font-medium text-[#1C1C1C] tracking-wide">
                      <div className="flex items-center gap-2">
                        {order.orderNumber || order.orderId}
                        {order.isGift && (
                          <span className="text-[9px] px-1.5 py-0.5 font-bold tracking-widest uppercase text-white rounded-sm" style={{ backgroundColor: '#B76E79' }}>
                            🎁 Gift
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-serif text-[#1C1C1C] text-lg leading-tight">{order.userId?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500 font-light mt-1">{order.userId?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-light text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-medium text-[#1C1C1C] tracking-wide">₹{order.totalAmount}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 border text-[10px] uppercase tracking-widest font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 border text-[10px] uppercase tracking-widest font-medium ${order.paymentStatus === 'paid'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <button className="text-gold hover:text-white hover:bg-gold px-4 py-2 border border-gold/50 transition-luxury flex items-center justify-end gap-2 ml-auto text-xs font-elegant tracking-widest uppercase">
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

