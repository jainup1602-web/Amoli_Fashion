'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Package, User, MapPin } from 'lucide-react';
import { alertSuccess, alertError } from '@/lib/alert';

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();

      if (!token) {
        console.error('No token available');
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/admin/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status: string) => {
    setUpdating(true);
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();

      if (!token) {
        alertError('Please login first');
        setUpdating(false);
        return;
      }

      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess('Order status updated!');
        fetchOrder();
      } else {
        alertError(data.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alertError('Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading order details...</div>;
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/orders" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Orders
        </Link>
        <h1 className="text-3xl font-bold">Order Details</h1>
        <p className="text-gray-600 mt-1">Order ID: {order.orderId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                  {item.productId?.images?.[0] && (
                    <img
                      src={item.productId.images[0]}
                      alt={item.productId.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.productId?.name || 'Product'}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Price: ₹{item.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Discount:</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <span>Shipping:</span>
                <span>₹{order.shippingCost}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Info Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Status</h2>
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(e.target.value)}
              disabled={updating}
              className="w-full px-3 py-2 border rounded-md mb-4"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-medium">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Customer */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{order.userId?.name || 'N/A'}</p>
              <p className="text-gray-600">{order.userId?.email || 'N/A'}</p>
              <p className="text-gray-600">{order.userId?.phone || 'N/A'}</p>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </h2>
            <div className="text-sm space-y-1">
              <p>{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                {order.shippingAddress?.pincode}
              </p>
              <p>{order.shippingAddress?.phone}</p>
            </div>
          </Card>

          {/* Gift Info */}
          {order.isGift && (
            <Card className="p-6" style={{ borderLeft: '4px solid #B76E79' }}>
              <h2 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: '#B76E79' }}>
                🎁 Gift Order
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gift Wrap:</span>
                  <span className="font-medium">{order.giftWrap ? '✅ Yes' : 'No'}</span>
                </div>
                {order.giftMessage && (
                  <div>
                    <span className="text-gray-600 block mb-1">Gift Message:</span>
                    <p className="bg-gray-50 p-3 text-sm italic text-gray-700" style={{ borderLeft: '2px solid #B76E79' }}>
                      &ldquo;{order.giftMessage}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Loyalty Points */}
          {(order.loyaltyPointsUsed > 0 || order.loyaltyPointsEarned > 0) && (
            <Card className="p-6">
              <h2 className="text-base font-bold mb-3">⭐ Loyalty Points</h2>
              <div className="space-y-2 text-sm">
                {order.loyaltyPointsUsed > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points Used:</span>
                    <span className="font-medium text-red-600">
                      -{order.loyaltyPointsUsed} pts (₹{(order.loyaltyPointsUsed * 0.5).toFixed(0)} off)
                    </span>
                  </div>
                )}
                {order.loyaltyPointsEarned > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points Earned:</span>
                    <span className="font-medium text-green-600">
                      +{order.loyaltyPointsEarned} pts
                    </span>
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
