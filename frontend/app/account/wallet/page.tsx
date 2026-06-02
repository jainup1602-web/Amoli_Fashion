'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { formatPrice } from '@/lib/utils';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/wallet', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setBalance(data.walletBalance);
        setTransactions(data.transactions);
      } else {
        setError(data.error || 'Failed to fetch wallet data');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  if (loading && balance === null) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" color="#1A1A1A" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-playfair text-[#1C1C1C] mb-3">My Wallet</h2>
        <p className="text-gray-500 font-light text-sm max-w-2xl leading-relaxed">
          Manage your funds securely. Use your available wallet balance seamlessly during checkout for faster, one-click purchases.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Premium Balance Card */}
      <div className="relative overflow-hidden rounded-2xl p-8 md:p-10 shadow-2xl group transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
          boxShadow: '0 20px 40px -10px rgba(26,26,26,0.3)',
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#B76E79]/20 to-transparent rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none translate-y-1/4 -translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-3 text-gray-300/80">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm uppercase tracking-[0.2em] font-semibold">Available Balance</span>
            </div>
            <div className="text-5xl md:text-6xl font-playfair tracking-wide text-white drop-shadow-sm flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl text-white/60 font-medium">₹</span>
              {balance !== null ? formatPrice(balance).replace('₹', '').trim() : '0.00'}
            </div>
          </div>
          
          <button 
            onClick={fetchWalletData}
            disabled={loading}
            className="flex items-center justify-center gap-2.5 px-6 py-3 bg-white hover:bg-gray-50 text-[#1A1A1A] transition-all duration-300 rounded-xl text-sm font-bold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group/btn active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 text-[#B76E79] ${loading ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'}`} />
            Refresh Balance
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="pt-4">
        <h3 className="text-xl font-playfair text-[#1C1C1C] mb-6 flex items-center gap-2">
          Transaction History
          <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium font-sans">
            {transactions.length}
          </span>
        </h3>
        
        {loading && transactions.length === 0 ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" color="#1A1A1A" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-5 md:p-6 flex items-start md:items-center justify-between hover:bg-gray-50/50 transition-colors group">
                  <div className="flex items-start md:items-center gap-4 md:gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                      tx.type === 'credit' 
                        ? 'bg-green-50 text-green-600 shadow-[0_4px_12px_rgba(22,163,74,0.1)]' 
                        : 'bg-red-50 text-red-600 shadow-[0_4px_12px_rgba(220,38,38,0.1)]'
                    }`}>
                      {tx.type === 'credit' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-medium text-[#1C1C1C] text-base mb-1">{tx.description}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        {new Date(tx.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className={`text-lg font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatPrice(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-mono bg-gray-50 inline-block px-2 py-0.5 rounded">
                      Bal: {formatPrice(tx.balance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CreditCard className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-[#1C1C1C] font-playfair text-2xl mb-3">No Transactions Yet</p>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              Your wallet history will appear here. Refunds for returned items or promotional credits will be automatically added to your wallet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
