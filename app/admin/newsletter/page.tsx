'use client';

import { useState, useEffect } from 'react';
import { Trash2, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, [statusFilter]);

  const fetchSubscribers = async () => {
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken(false);
      
      if (!token) {
        console.error('No token available');
        setLoading(false);
        return;
      }

      let url = '/api/admin/newsletter';
      if (statusFilter) url += `?status=${statusFilter}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete('this subscriber');
    if (!ok) return;

    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken(false);
      
      if (!token) {
        alertError('Please login first');
        return;
      }

      const res = await fetch(`/api/admin/newsletter?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess('Subscriber deleted!');
        fetchSubscribers();
      } else {
        alertError(data.message || 'Failed to delete subscriber');
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alertError('Failed to delete subscriber');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken(false);
      
      if (!token) {
        alertError('Please login first');
        return;
      }

      const res = await fetch('/api/admin/newsletter', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });

      const data = await res.json();
      if (data.success) {
        fetchSubscribers();
      } else {
        alertError(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alertError('Failed to update status');
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Email', 'Status', 'Subscribed Date'],
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.isActive ? 'Active' : 'Inactive',
        new Date(sub.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.isActive).length,
    inactive: subscribers.filter(s => !s.isActive).length,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
          <p className="text-gray-600 mt-1">Manage and export subscriber list</p>
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Total Subscribers</p>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Inactive</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">{stats.inactive}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading subscribers...</div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No subscribers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Subscribed</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{subscriber.email}</td>
                    <td className="py-3 px-4">
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(subscriber.id, subscriber.isActive)}
                        className={`px-2 py-1 rounded text-xs ${
                          subscriber.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {subscriber.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(subscriber.id)}
                        className="text-red-600 hover:underline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

