'use client';

import { useState, useEffect } from 'react';
import { Package, Search, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [adjustedRefund, setAdjustedRefund] = useState('');

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = new URL('/api/admin/returns', window.location.origin);
      if (filterStatus !== 'all') url.searchParams.append('status', filterStatus);
      
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setReturns(data.returns);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [filterStatus]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedReturn) return;
    setActionLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const payload: any = { action, adminNotes };
      if (action === 'approve' && adjustedRefund) {
        payload.adjustedRefundAmount = Number(adjustedRefund);
      }

      const res = await fetch(`/api/admin/returns/${selectedReturn.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setIsModalOpen(false);
        setAdminNotes('');
        setAdjustedRefund('');
        fetchReturns();
        alert(data.message);
      } else {
        alert(data.error || 'Failed to process return');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const openReturnModal = (ret: any) => {
    setSelectedReturn(ret);
    setAdjustedRefund(ret.refundAmount.toString());
    setAdminNotes('');
    setIsModalOpen(true);
  };

  const statusColors: any = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Return Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer return and refund requests.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-black"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm border border-red-100">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Returns Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Request ID / Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Order / Reason</th>
                <th className="px-6 py-4">Refund Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No return requests found.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-gray-500 mb-1">#{ret.id.substring(0,8).toUpperCase()}</div>
                      <div className="text-gray-900">{new Date(ret.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{ret.user?.displayName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{ret.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-blue-600 mb-1 hover:underline cursor-pointer">Order: {ret.order?.orderNumber}</div>
                      <div className="text-xs text-gray-600 truncate max-w-[200px]" title={ret.reason}>{ret.reason}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatPrice(ret.refundAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[ret.status] || 'bg-gray-100'}`}>
                        {ret.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openReturnModal(ret)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors inline-flex items-center"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Action Modal */}
      {isModalOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                Return Request Details
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Customer</p>
                  <p className="font-medium text-gray-900">{selectedReturn.user?.displayName}</p>
                  <p className="text-sm text-gray-600">{selectedReturn.user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order Info</p>
                  <p className="font-medium text-gray-900">{selectedReturn.order?.orderNumber}</p>
                  <p className="text-sm text-gray-600">Payment: {selectedReturn.order?.paymentMethod.toUpperCase()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Return Reason</p>
                <div className="bg-white border border-gray-200 p-3 rounded-lg text-sm text-gray-700">
                  <p className="font-medium mb-1">{selectedReturn.reason}</p>
                  {selectedReturn.comments && <p className="text-gray-500 text-xs mt-2 border-t border-gray-100 pt-2">{selectedReturn.comments}</p>}
                </div>
              </div>

              {selectedReturn.productImage && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Customer Uploaded Image</p>
                  <div className="w-full max-w-xs aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img src={selectedReturn.productImage} alt="Return issue" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              {selectedReturn.status === 'pending' && (
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Admin Actions</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adjusted Refund Amount (₹)</label>
                    <input 
                      type="number" 
                      value={adjustedRefund}
                      onChange={e => setAdjustedRefund(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave as default to refund the full product price.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Optional)</label>
                    <textarea 
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black outline-none resize-none"
                      placeholder="Notes for internal reference or customer..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject Request
                    </button>
                    <button 
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve & Refund to Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
