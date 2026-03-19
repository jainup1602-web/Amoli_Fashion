'use client';

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, ratingFilter]);

  const fetchReviews = async () => {
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      
      if (!token) {
        console.error('No token available');
        setLoading(false);
        return;
      }

      let url = '/api/admin/reviews';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (ratingFilter) params.append('rating', ratingFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      
      if (!token) {
        alertError('Please login first');
        return;
      }

      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, isApproved: !currentStatus }),
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess(currentStatus ? 'Review rejected!' : 'Review approved!');
        fetchReviews();
      } else {
        alertError(data.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alertError('Failed to update review');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete('this review');
    if (!ok) return;

    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      
      if (!token) {
        alertError('Please login first');
        return;
      }

      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess('Review deleted!');
        fetchReviews();
      } else {
        alertError(data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alertError('Failed to delete review');
    }
  };

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => !r.isApproved).length,
    approved: reviews.filter(r => r.isApproved).length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Review Management</h1>
        <p className="text-gray-600 mt-1">Moderate and manage customer reviews</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Total Reviews</p>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Avg Rating</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.avgRating}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No reviews found</div>
        ) : (
          <div className="divide-y">
            {reviews.map((review) => (
              <div key={review.id} className="py-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium">{review.productId?.name || 'Product'}</p>
                    <p className="text-sm text-gray-600">
                      by {review.userId?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{review.comment}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(review.id, review.isApproved)}
                    className={`px-4 py-2 rounded-md text-sm ${
                      review.isApproved
                        ? 'bg-gray-200 hover:bg-gray-300'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {review.isApproved ? 'Reject' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

