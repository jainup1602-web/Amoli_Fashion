'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  User, Mail, Phone, MapPin, Calendar, ShoppingCart, CreditCard,
  ArrowLeft, Star, TrendingUp, Package, ExternalLink, Eye
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function CustomerDetailPage() {
  const params = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) fetchCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      if (!token) { setLoading(false); return; }

      const res = await fetch(`/api/admin/users/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.user);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-100 rounded-2xl" />
          <div className="lg:col-span-2 h-96 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-16">
        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Customer not found</p>
        <Link href="/admin/users" className="text-[#B76E79] text-sm mt-2 inline-block hover:underline">← Back to Users</Link>
      </div>
    );
  }

  // Calculate analytics from orders
  const orders = customer.order || [];
  const totalSpent = orders.reduce((sum: number, o: any) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const paidOrders = orders.filter((o: any) => o.paymentStatus === 'paid');
  const avgOrderValue = paidOrders.length > 0 ? totalSpent / paidOrders.length : 0;
  const lastOrderDate = orders.length > 0 ? new Date(orders[0].createdAt) : null;

  // Parse saved addresses
  let addresses: any[] = [];
  try {
    if (customer.savedAddresses) {
      addresses = typeof customer.savedAddresses === 'string'
        ? JSON.parse(customer.savedAddresses)
        : customer.savedAddresses;
    }
  } catch { addresses = []; }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/users" className="text-sm text-gray-400 hover:text-[#B76E79] transition-colors flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3 w-3" /> Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Profile Card */}
        <div className="space-y-6">
          <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
            <div className="bg-gradient-to-br from-[#B76E79]/10 to-[#B76E79]/5 p-8 text-center">
              <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg" style={{ backgroundColor: '#B76E79' }}>
                {customer.displayName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <h2 className="text-lg font-bold text-gray-900 mt-4">{customer.displayName || 'Unknown'}</h2>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mt-2 ${
                customer.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : customer.role === 'distributor' ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
                {customer.role}
              </span>
            </div>
            <div className="p-6 space-y-4">
              {customer.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 truncate">{customer.email}</span>
                </div>
              )}
              {customer.phoneNumber && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">{customer.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">Joined {new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <span className="text-gray-600"><span className="font-bold text-amber-600">{customer.loyaltyPoints || 0}</span> loyalty points</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className={`w-2.5 h-2.5 rounded-full ${customer.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className="text-gray-600">{customer.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </Card>

          {/* Analytics */}
          <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Analytics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-gray-600">Total Spent</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatPrice(totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Total Orders</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{orders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-violet-500" />
                  <span className="text-sm text-gray-600">Avg Order Value</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatPrice(avgOrderValue)}</span>
              </div>
              {lastOrderDate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Last Order</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{lastOrderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Saved Addresses */}
          {addresses.length > 0 && (
            <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                Addresses
              </h3>
              <div className="space-y-3">
                {addresses.map((addr: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                    {addr.fullName && <p className="font-medium text-gray-900">{addr.fullName}</p>}
                    <p>{addr.address || addr.addressLine1}</p>
                    <p>{addr.city}, {addr.state} {addr.pincode}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Order History */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900">Order History</h2>
              </div>
              <span className="text-xs text-gray-400 font-medium">{orders.length} orders</span>
            </div>
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100">
                      <th className="py-3 px-6 font-bold">Order</th>
                      <th className="py-3 px-6 font-bold">Date</th>
                      <th className="py-3 px-6 font-bold">Amount</th>
                      <th className="py-3 px-6 font-bold text-center">Status</th>
                      <th className="py-3 px-6 font-bold text-center">Payment</th>
                      <th className="py-3 px-6 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-3 px-6">
                          <span className="text-sm font-bold text-gray-900">{order.orderNumber}</span>
                        </td>
                        <td className="py-3 px-6">
                          <span className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right">
                          <Link href={`/admin/orders/${order.id}`}>
                            <button className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#B76E79] bg-[#B76E79]/5 border border-[#B76E79]/20 rounded-lg hover:bg-[#B76E79]/10 transition-colors opacity-0 group-hover:opacity-100">
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
            ) : (
              <div className="p-16 text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No orders from this customer yet.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
