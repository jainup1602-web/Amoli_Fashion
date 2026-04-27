'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, ShoppingBag, Star, Shield, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserDetail {
  id: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  role: string;
  isActive: boolean;
  loyaltyPoints: number;
  createdAt: string;
  order?: Array<{
    id: string;
    orderId: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function UserDetailsPage() {
  const params = useParams();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPoints, setEditingPoints] = useState(false);
  const [pointsValue, setPointsValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.id) fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { toast.error('Please login first'); setLoading(false); return; }

      const res = await fetch(`/api/admin/users/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setPointsValue(String(data.user.loyaltyPoints ?? 0));
      } else {
        toast.error('Failed to load user');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePoints = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ loyaltyPoints: parseInt(pointsValue) || 0 }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Loyalty points updated');
        setUser(prev => prev ? { ...prev, loyaltyPoints: parseInt(pointsValue) || 0 } : prev);
        setEditingPoints(false);
      } else {
        toast.error('Failed to update points');
      }
    } catch (err) {
      toast.error('Failed to update points');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'}`);
        setUser(prev => prev ? { ...prev, isActive: !prev.isActive } : prev);
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const totalSpent = user?.order?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7]">
        <div className="loading-jewelry"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 font-light">User not found</p>
        <Link href="/admin/users" className="text-gold text-sm mt-4 inline-block hover:underline">← Back to Users</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gold/20 pb-6">
        <div>
          <Link href="/admin/users" className="text-gold text-xs tracking-widest font-elegant uppercase hover:underline mb-2 inline-block">
            ← Back to Users
          </Link>
          <h1 className="text-3xl font-serif text-[#1C1C1C]">{user.displayName || 'Unknown User'}</h1>
          <p className="text-gray-400 text-sm font-light mt-1 tracking-wide">{user.email || user.phoneNumber}</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <span className={`px-3 py-1 border text-[10px] uppercase tracking-widest font-medium ${user.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleStatus}
            className={`rounded-none border text-xs tracking-widest font-elegant uppercase px-4 ${user.isActive ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
          >
            {user.isActive ? <><X className="h-3 w-3 mr-1" /> Deactivate</> : <><Check className="h-3 w-3 mr-1" /> Activate</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info + Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card className="p-6 border border-gold/10 shadow-sm rounded-none">
            <h2 className="text-base font-serif text-[#1C1C1C] mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-gold" />
              Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-elegant mb-1">Full Name</p>
                <p className="font-medium text-[#1C1C1C]">{user.displayName || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-elegant mb-1">Email</p>
                <p className="font-medium text-[#1C1C1C]">{user.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-elegant mb-1">Phone</p>
                <p className="font-medium text-[#1C1C1C]">{user.phoneNumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-elegant mb-1">Joined</p>
                <p className="font-medium text-[#1C1C1C]">{new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </Card>

          {/* Order History */}
          <Card className="p-6 border border-gold/10 shadow-sm rounded-none">
            <h2 className="text-base font-serif text-[#1C1C1C] mb-4 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-gold" />
              Recent Orders
            </h2>
            {user.order && user.order.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gold/20 text-xs font-elegant tracking-widest uppercase text-gray-500">
                      <th className="py-3 px-3 font-normal">Order ID</th>
                      <th className="py-3 px-3 font-normal">Date</th>
                      <th className="py-3 px-3 font-normal">Total</th>
                      <th className="py-3 px-3 font-normal">Status</th>
                      <th className="py-3 px-3 font-normal text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {user.order.map((o) => (
                      <tr key={o.id} className="hover:bg-[#FDFBF7] transition-colors">
                        <td className="py-3 px-3 text-sm font-medium text-[#1C1C1C]">#{o.orderId}</td>
                        <td className="py-3 px-3 text-sm text-gray-500 font-light">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-3 text-sm font-medium">₹{o.totalAmount?.toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-1 border text-[10px] uppercase tracking-widest font-medium ${getStatusColor(o.status)}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link href={`/admin/orders/${o.id}`} className="text-gold text-xs hover:underline font-elegant tracking-wide">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 font-light italic text-sm py-4">No orders yet</p>
            )}
          </Card>
        </div>

        {/* Right: Stats + Loyalty + Role */}
        <div className="space-y-6">
          {/* Stats */}
          <Card className="p-6 border border-gold/10 shadow-sm rounded-none">
            <h2 className="text-base font-serif text-[#1C1C1C] mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-elegant">Total Orders</span>
                <span className="font-serif text-xl text-[#1C1C1C]">{user.order?.length ?? 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-elegant">Total Spent</span>
                <span className="font-serif text-xl text-[#1C1C1C]">₹{totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-elegant">Avg Order</span>
                <span className="font-serif text-xl text-[#1C1C1C]">
                  ₹{user.order?.length ? Math.round(totalSpent / user.order.length).toLocaleString() : 0}
                </span>
              </div>
            </div>
          </Card>

          {/* Loyalty Points */}
          <Card className="p-6 border border-gold/10 shadow-sm rounded-none">
            <h2 className="text-base font-serif text-[#1C1C1C] mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Loyalty Points
            </h2>
            {editingPoints ? (
              <div className="space-y-3">
                <input
                  type="number"
                  min="0"
                  value={pointsValue}
                  onChange={(e) => setPointsValue(e.target.value)}
                  className="w-full border border-gold/30 rounded-none px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSavePoints}
                    disabled={saving}
                    className="flex-1 rounded-none bg-gold hover:bg-gold/90 text-white text-xs tracking-widest font-elegant uppercase"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditingPoints(false); setPointsValue(String(user.loyaltyPoints ?? 0)); }}
                    className="flex-1 rounded-none border border-gray-200 text-xs tracking-widest font-elegant uppercase"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-3xl font-serif text-amber-600">⭐ {user.loyaltyPoints ?? 0}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPoints(true)}
                  className="text-xs text-gold border border-gold/30 hover:bg-gold/10 rounded-none px-3 font-elegant tracking-widest uppercase"
                >
                  Edit
                </Button>
              </div>
            )}
            <p className="text-xs text-gray-400 font-light mt-2">Worth ₹{((user.loyaltyPoints ?? 0) * 0.5).toFixed(0)} in discounts</p>
          </Card>

          {/* Role */}
          <Card className="p-6 border border-gold/10 shadow-sm rounded-none">
            <h2 className="text-base font-serif text-[#1C1C1C] mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-gold" />
              Role
            </h2>
            <span className={`px-3 py-1 border text-[10px] uppercase tracking-widest font-medium ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
              user.role === 'distributor' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                user.role === 'retailer' ? 'bg-green-50 text-green-700 border-green-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
              {user.role}
            </span>
            <p className="text-xs text-gray-400 font-light mt-3">
              To change role, use the edit button on the <Link href="/admin/users" className="text-gold hover:underline">Users list</Link>.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
