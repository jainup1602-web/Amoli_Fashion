'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Search, ArrowUpRight, ArrowDownRight, UserPlus, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function AdminWalletPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // For manual adjustments
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({
    userId: '',
    type: 'credit',
    amount: '',
    description: '',
  });
  const [adjusting, setAdjusting] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = new URL('/api/admin/wallet', window.location.origin);
      if (searchTerm) url.searchParams.append('search', searchTerm);
      
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setTransactions(data.transactions);
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
    const delayDebounceFn = setTimeout(() => {
      fetchTransactions();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleAdjustWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjusting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/wallet', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          userId: adjustData.userId,
          type: adjustData.type,
          amount: Number(adjustData.amount),
          description: adjustData.description,
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsAdjustModalOpen(false);
        setAdjustData({ userId: '', type: 'credit', amount: '', description: '' });
        fetchTransactions();
      } else {
        alert(data.error || 'Failed to adjust wallet');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Wallet Management</h1>
          <p className="text-sm text-gray-500 mt-1">View user wallet transactions and make manual adjustments.</p>
        </div>
        <button
          onClick={() => setIsAdjustModalOpen(true)}
          className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Adjust Balance
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by User Name or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-gray-400"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm border border-red-100">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{tx.user?.displayName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{tx.user?.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        tx.type === 'credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {tx.type === 'credit' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">
                        Bal: {formatCurrency(tx.balance)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Wallet Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Adjust Wallet Balance</h2>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleAdjustWallet} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input 
                  type="text" 
                  required
                  value={adjustData.userId}
                  onChange={e => setAdjustData({...adjustData, userId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black outline-none"
                  placeholder="Paste User UUID"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    value={adjustData.type}
                    onChange={e => setAdjustData({...adjustData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black outline-none"
                  >
                    <option value="credit">Credit (Add)</option>
                    <option value="debit">Debit (Remove)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    required min="1"
                    value={adjustData.amount}
                    onChange={e => setAdjustData({...adjustData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Reason</label>
                <input 
                  type="text" 
                  required
                  value={adjustData.description}
                  onChange={e => setAdjustData({...adjustData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black outline-none"
                  placeholder="e.g. Compensation for delayed order"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={adjusting}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {adjusting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
