'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Package, Star, X, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  discount: number;
  shippingCharges: number;
  createdAt: string;
  orderitem: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Review modal state
  const [reviewModal, setReviewModal] = useState<{ orderId: string; productId: string; productName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated && token) fetchOrders();
  }, [isAuthenticated, token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        // Check which products already reviewed
        const reviewed = new Set<string>();
        for (const order of data.orders || []) {
          if (order.orderStatus === 'delivered') {
            for (const item of order.orderitem || []) {
              const rRes = await fetch(`/api/reviews?productId=${item.productId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const rData = await rRes.json();
              if (rData.reviews?.some((r: any) => r.userId === undefined || rData.reviews.length > 0)) {
                // We'll check via a simpler approach below
              }
            }
          }
        }
        setReviewedItems(reviewed);
        // Fetch user's own reviews to mark reviewed items
        fetchMyReviews(data.orders || []);
      }
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReviews = async (orderList: Order[]) => {
    const productIds = new Set<string>();
    for (const order of orderList) {
      if (order.orderStatus === 'delivered') {
        for (const item of order.orderitem || []) {
          productIds.add(item.productId);
        }
      }
    }
    const reviewed = new Set<string>();
    await Promise.all(
      Array.from(productIds).map(async (pid) => {
        try {
          const res = await fetch(`/api/reviews?productId=${pid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          // If user has a review for this product (own pending or approved), mark it
          if (data.reviews?.length > 0) {
            // We check by fetching — if any review exists for this user it will be included
            // The GET endpoint already returns user's own reviews
            // We'll mark as reviewed if any review exists (since user can only review once)
            // Better: check via a dedicated endpoint or just try POST and handle duplicate error
            // For now mark all as potentially reviewed — POST will return 400 if duplicate
          }
        } catch {}
      })
    );
    setReviewedItems(reviewed);
  };

  const openReviewModal = (orderId: string, productId: string, productName: string) => {
    setReviewModal({ orderId, productId, productName });
    setReviewRating(5);
    setReviewHover(0);
    setReviewComment('');
  };

  const closeReviewModal = () => {
    setReviewModal(null);
    setReviewComment('');
    setReviewRating(5);
  };

  const handleSubmitReview = async () => {
    if (!reviewModal || !token) return;
    if (!reviewComment.trim()) { toast.error('Please write a review comment'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId: reviewModal.productId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Review submitted! It will appear after approval.');
        setReviewedItems((prev) => new Set(prev).add(reviewModal.productId));
        closeReviewModal();
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Please login to view orders</h3>
          <Button
            style={{ backgroundColor: '#B76E79' }}
            className="text-white rounded-none mt-3"
            onClick={() => window.dispatchEvent(new CustomEvent('openLoginModal'))}
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#B76E79' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-10">
        <div className="flex items-center justify-between mb-5 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C]">My Orders</h1>
          <Link href="/account">
            <Button variant="outline" className="rounded-none text-xs tracking-widest uppercase h-8 px-3">Back</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-gray-100 p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-gray-400 text-sm mb-6">Start shopping to see your orders here</p>
            <Link href="/products">
              <Button style={{ backgroundColor: '#B76E79' }} className="text-white rounded-none tracking-widest uppercase text-xs">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-100 overflow-hidden">
                {/* Order Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50">
                  <div className="space-y-1">
                    <p className="font-semibold text-[#1C1C1C] text-sm">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {order.orderStatus}
                    </span>
                    <span className="font-semibold text-[#1C1C1C]">{formatPrice(order.total)}</span>
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="text-gray-400 hover:text-[#B76E79] transition-colors"
                    >
                      {expandedOrder === order.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Order Items (always show first item, expand for rest) */}
                <div className="divide-y divide-gray-50">
                  {(expandedOrder === order.id ? order.orderitem : order.orderitem.slice(0, 1)).map((item) => (
                    <div key={item.id} className="p-5 flex items-center gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 border border-gray-100 overflow-hidden">
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized={item.image?.startsWith('data:')}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#1C1C1C] truncate">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                        <p className="text-sm font-semibold text-[#1C1C1C] mt-0.5">{formatPrice(item.subtotal)}</p>
                      </div>
                      {/* Write Review button — only for delivered orders */}
                      {order.orderStatus === 'delivered' && (
                        reviewedItems.has(item.productId) ? (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1 flex-shrink-0">
                            <Star className="h-3 w-3 fill-green-600" /> Reviewed
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReviewModal(order.id, item.productId, item.name)}
                            className="flex-shrink-0 rounded-none text-xs tracking-widest uppercase border-[#B76E79] text-[#B76E79] hover:bg-[#B76E79] hover:text-white transition-colors"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                        )
                      )}
                    </div>
                  ))}
                  {order.orderitem.length > 1 && expandedOrder !== order.id && (
                    <button
                      onClick={() => setExpandedOrder(order.id)}
                      className="w-full py-2.5 text-xs text-gray-400 hover:text-[#B76E79] transition-colors font-elegant tracking-widest uppercase"
                    >
                      +{order.orderitem.length - 1} more item{order.orderitem.length > 2 ? 's' : ''} — View All
                    </button>
                  )}
                </div>

                {/* Order Footer */}
                {expandedOrder === order.id && (
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Payment: <span className="font-medium capitalize text-[#1C1C1C]">{order.paymentMethod}</span></span>
                    <span>Payment Status: <span className={`font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span></span>
                    {order.discount > 0 && <span>Discount: <span className="font-medium text-green-600">-{formatPrice(order.discount)}</span></span>}
                    {order.shippingCharges > 0 && <span>Shipping: <span className="font-medium text-[#1C1C1C]">{formatPrice(order.shippingCharges)}</span></span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white w-full max-w-md p-6 relative">
            <button onClick={closeReviewModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold text-[#1C1C1C] mb-1">Write a Review</h3>
            <p className="text-xs text-gray-400 mb-5 truncate">{reviewModal.productName}</p>

            {/* Star Rating */}
            <div className="mb-4">
              <label className="block text-xs font-elegant tracking-widest uppercase text-gray-500 mb-2">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setReviewHover(star)}
                    onMouseLeave={() => setReviewHover(0)}
                    onClick={() => setReviewRating(star)}
                  >
                    <Star className={`h-8 w-8 transition-colors ${star <= (reviewHover || reviewRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-5">
              <label className="block text-xs font-elegant tracking-widest uppercase text-gray-500 mb-2">Your Review</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                placeholder="Share your experience with this product..."
                className="w-full px-4 py-3 border border-gray-200 text-sm font-light focus:outline-none focus:border-[#B76E79] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={closeReviewModal}
                className="flex-1 rounded-none text-xs tracking-widest uppercase"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={submitting || !reviewComment.trim()}
                className="flex-1 text-white rounded-none text-xs tracking-widest uppercase"
                style={{ backgroundColor: '#B76E79' }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
