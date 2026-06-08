'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import {
  Package, User, MapPin, ArrowLeft, FileText, Truck, CheckCircle,
  Clock, AlertCircle, Download, Copy, ExternalLink
} from 'lucide-react';
import { alertSuccess, alertError } from '@/lib/alert';
import { formatPrice } from '@/lib/utils';

const STATUS_STEPS = ['confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    if (params.id) fetchOrder();
  }, [params.id]);

  const getToken = async () => {
    const { getAuthToken } = await import('@/lib/firebase-client');
    return await getAuthToken();
  };

  const fetchOrder = async () => {
    try {
      const token = await getToken();
      if (!token) { setLoading(false); return; }

      const res = await fetch(`/api/admin/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        // Auto-fetch tracking if shipment exists
        if (data.order.shipmentId) {
          fetchTracking(data.order.shipmentId);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to update the order status to "${newStatus}"?`)) return;
    setUpdating(true);
    try {
      const token = await getToken();
      if (!token) { alertError('Please login first'); setUpdating(false); return; }

      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess('Order status updated!');
        fetchOrder();
      } else {
        alertError(data.message || 'Failed to update order');
      }
    } catch (error) {
      alertError('Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const fetchTracking = async (shipmentId: string) => {
    setTrackingLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`/api/admin/shipping/track/${shipmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTrackingData(data.tracking);
      }
    } catch (error) {
      console.error('Tracking fetch error:', error);
    } finally {
      setTrackingLoading(false);
    }
  };

  const generateInvoice = async () => {
    if (!order?.shiprocketOrderId) {
      alertError('No Shiprocket order ID found for this order');
      return;
    }
    setInvoiceLoading(true);
    try {
      const token = await getToken();
      if (!token) { alertError('Please login first'); return; }

      const res = await fetch('/api/admin/shipping/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderIds: [order.shiprocketOrderId] }),
      });
      const data = await res.json();
      if (data.success && data.invoiceUrl) {
        window.open(data.invoiceUrl, '_blank');
        alertSuccess('Invoice generated!');
      } else {
        alertError(data.message || 'Failed to generate invoice');
      }
    } catch (error) {
      alertError('Failed to generate invoice');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alertSuccess('Copied to clipboard!');
  };

  // Parse shipping address
  const getShippingAddress = () => {
    if (!order?.shippingAddress) return null;
    try {
      return typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;
    } catch { return null; }
  };

  const getStatusStep = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'cancelled') return -1;
    return STATUS_STEPS.indexOf(s);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-blue-500';
      case 'processing': return 'bg-amber-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-emerald-500';
      case 'cancelled': return 'bg-rose-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-100 rounded-2xl" />
          <div className="h-96 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Order not found</p>
        <Link href="/admin/orders" className="text-[#B76E79] text-sm mt-2 inline-block hover:underline">← Back to Orders</Link>
      </div>
    );
  }

  const address = getShippingAddress();
  const currentStep = getStatusStep(order.orderStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="text-sm text-gray-400 hover:text-[#B76E79] transition-colors flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generateInvoice}
            disabled={invoiceLoading || !order.shiprocketOrderId}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FileText className="h-4 w-4" />
            {invoiceLoading ? 'Generating...' : 'Invoice'}
          </button>
        </div>
      </div>

      {/* Status Timeline */}
      {order.orderStatus !== 'cancelled' && (
        <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Order Progress</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
          </div>
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 mx-12" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-[#B76E79] mx-12 transition-all duration-500"
              style={{ width: `${Math.max(0, currentStep / (STATUS_STEPS.length - 1)) * (100 - 15)}%` }}
            />

            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;
              return (
                <div key={step} className="flex flex-col items-center z-10 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#B76E79] border-[#B76E79] text-white'
                      : 'bg-white border-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-[#B76E79]/20' : ''}`}>
                    {index === 0 && <Clock className="h-4 w-4" />}
                    {index === 1 && <Package className="h-4 w-4" />}
                    {index === 2 && <Truck className="h-4 w-4" />}
                    {index === 3 && <CheckCircle className="h-4 w-4" />}
                  </div>
                  <span className={`text-xs mt-2 font-medium capitalize ${isCompleted ? 'text-[#B76E79]' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {order.orderStatus === 'cancelled' && (
        <Card className="p-6 border border-rose-200 bg-rose-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-rose-500" />
            <div>
              <p className="font-bold text-rose-700">Order Cancelled</p>
              {order.cancelReason && <p className="text-sm text-rose-600 mt-1">{order.cancelReason}</p>}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
              <span className="text-xs text-gray-400 ml-auto">{order.orderitem?.length || 0} items</span>
            </div>
            <div className="divide-y divide-gray-50">
              {order.orderitem?.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 p-5">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(item.subtotal || item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="p-5 bg-gray-50/50 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>{order.shippingCharges > 0 ? formatPrice(order.shippingCharges) : 'Free'}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </Card>

          {/* Shiprocket Tracking */}
          {(order.shipmentId || order.trackingNumber) && (
            <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-bold text-gray-900">Shipment Tracking</h2>
                </div>
                {order.trackingNumber && (
                  <button
                    onClick={() => copyToClipboard(order.trackingNumber)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#B76E79] transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    AWB: {order.trackingNumber}
                  </button>
                )}
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {order.shiprocketOrderId && (
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Shiprocket ID</p>
                      <p className="text-sm font-medium text-gray-900">{order.shiprocketOrderId}</p>
                    </div>
                  )}
                  {order.shipmentId && (
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Shipment ID</p>
                      <p className="text-sm font-medium text-gray-900">{order.shipmentId}</p>
                    </div>
                  )}
                  {order.shippingProvider && (
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Courier</p>
                      <p className="text-sm font-medium text-gray-900">{order.shippingProvider}</p>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">AWB Number</p>
                      <p className="text-sm font-medium text-gray-900">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>

                {trackingLoading && <p className="text-sm text-gray-400 text-center py-4">Loading tracking info...</p>}

                {trackingData?.tracking_data?.shipment_track_activities && (
                  <div className="space-y-0 border-l-2 border-gray-200 ml-4">
                    {trackingData.tracking_data.shipment_track_activities.map((activity: any, i: number) => (
                      <div key={i} className="relative pl-6 pb-6 last:pb-0">
                        <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${i === 0 ? 'bg-[#B76E79]' : 'bg-gray-300'}`} />
                        <p className="text-sm font-medium text-gray-900">{activity['sr-status-label'] || activity.activity}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.location}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{activity.date}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Update Status</h2>
            <select
              value={order.orderStatus}
              onChange={(e) => updateOrderStatus(e.target.value)}
              disabled={updating}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm font-medium focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79]/20 outline-none disabled:opacity-50 transition-colors"
            >
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.paymentStatus?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900">{order.paymentMethod?.toUpperCase()}</span>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Razorpay ID</span>
                  <span className="font-medium text-gray-600 text-xs">{order.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Customer */}
          <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Customer</h2>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{order.customerName}</p>
              <p className="text-gray-500">{order.customerEmail}</p>
              <p className="text-gray-500">{order.customerPhone}</p>
              {order.userId && (
                <Link href={`/admin/users/${order.userId}`} className="text-xs text-[#B76E79] hover:underline flex items-center gap-1 mt-2">
                  View Profile <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </Card>

          {/* Shipping Address */}
          {address && (
            <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Shipping Address</h2>
              </div>
              <div className="text-sm space-y-1 text-gray-600">
                {address.fullName && <p className="font-medium text-gray-900">{address.fullName}</p>}
                <p>{address.address || address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}, {address.state} {address.pincode}</p>
                {address.phone && <p>{address.phone}</p>}
              </div>
            </Card>
          )}

          {/* Gift Info */}
          {order.isGift && (
            <Card className="border-l-4 border-[#B76E79] border border-gray-100 shadow-sm rounded-2xl bg-white p-6">
              <h2 className="text-sm font-bold text-[#B76E79] uppercase tracking-wider mb-3">🎁 Gift Order</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gift Wrap</span>
                  <span className="font-medium">{order.giftWrap ? '✅ Yes' : 'No'}</span>
                </div>
                {order.giftMessage && (
                  <div>
                    <span className="text-gray-500 block mb-1">Gift Message:</span>
                    <p className="bg-gray-50 p-3 text-sm italic text-gray-700 rounded-lg border-l-2 border-[#B76E79]">
                      &ldquo;{order.giftMessage}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Notes */}
          {order.notes && (
            <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Admin Notes</h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </Card>
          )}

          {/* Loyalty Points */}
          {(order.loyaltyPointsUsed > 0 || order.loyaltyPointsEarned > 0) && (
            <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">⭐ Loyalty Points</h2>
              <div className="space-y-2 text-sm">
                {order.loyaltyPointsUsed > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Points Used</span>
                    <span className="font-medium text-rose-600">-{order.loyaltyPointsUsed} pts</span>
                  </div>
                )}
                {order.loyaltyPointsEarned > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Points Earned</span>
                    <span className="font-medium text-emerald-600">+{order.loyaltyPointsEarned} pts</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
