'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, X, Check } from 'lucide-react';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface User {
  id: string;
  firebaseUid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(u =>
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phoneNumber?.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        console.log('No user logged in');
        toast.error('Please login to view users');
        return;
      }

      const token = await currentUser.getIdToken();
      console.log('🔄 Fetching users...');

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Users data:', data);

        if (data.error) {
          toast.error(data.error);
          console.error('Database error:', data.message);
        }

        setUsers(data.users || []);
        setFilteredUsers(data.users || []);

        if (data.users && data.users.length > 0) {
          toast.success(`Loaded ${data.users.length} users`);
        } else {
          toast.error('No users found. Check MongoDB connection.');
        }
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
        toast.error('Failed to fetch users: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Users fetch error:', error);
      toast.error('Failed to fetch users. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        toast.error('Please login first');
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchUsers();
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update user status');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'distributor':
        return 'bg-blue-100 text-blue-800';
      case 'retailer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7]">
        <div className="loading-jewelry"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gold/20 pb-6">
        <div>
          <span className="text-gold tracking-[0.2em] text-xs uppercase mb-2 block font-elegant">Accounts</span>
          <h1 className="text-3xl font-serif text-[#1C1C1C]">Users Management</h1>
        </div>
        <p className="text-gray-500 mt-4 md:mt-0 font-light tracking-wide text-sm">Manage all registered users</p>
      </div>

      <Card className="p-8 border border-gold/10 shadow-sm rounded-none bg-gray-50">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="pl-12 rounded-none border-gold/30 focus-visible:ring-gold focus-visible:ring-offset-0 font-light"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm font-elegant tracking-widest text-gray-400 uppercase">
            {filteredUsers.length} Users
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gold/20 text-xs font-elegant tracking-widest uppercase text-gray-500">
                <th className="py-4 px-4 font-normal">Name</th>
                <th className="py-4 px-4 font-normal">Email/Phone</th>
                <th className="py-4 px-4 font-normal">Role</th>
                <th className="py-4 px-4 font-normal">Status</th>
                <th className="py-4 px-4 font-normal">Joined</th>
                <th className="py-4 px-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FDFBF7] transition-colors group">
                    <td className="py-4 px-4">
                      <div className="font-serif text-[#1C1C1C] text-lg leading-tight">{u.displayName || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-light">
                        {u.email && <div className="text-[#1C1C1C]">{u.email}</div>}
                        {u.phoneNumber && <div className="text-gray-500 text-xs tracking-wide">{u.phoneNumber}</div>}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 border text-[10px] uppercase tracking-widest font-medium ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        u.role === 'distributor' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          u.role === 'retailer' ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 border text-[10px] uppercase tracking-widest font-medium ${u.isActive
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500 font-light">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/users/${u.id}`}>
                          <Button variant="ghost" size="sm" title="View Details" className="h-8 w-8 p-0 text-gold hover:text-gold hover:bg-gold/10 rounded-none border border-transparent hover:border-gold/30">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(u.id, u.isActive)}
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                          className={`h-8 w-8 p-0 rounded-none border border-transparent ${u.isActive ? 'text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200' : 'text-green-500 hover:text-green-700 hover:bg-green-50 hover:border-green-200'}`}
                        >
                          {u.isActive ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="space-y-3">
                      <div className="text-gray-400 font-light italic text-sm">
                        {searchTerm ? 'No users found matching your search' : 'No users found in database'}
                      </div>
                      {!searchTerm && (
                        <div className="text-xs text-gray-400/80 space-y-2 font-elegant tracking-wide">
                          <p>Possible reasons:</p>
                          <ul className="list-inside space-y-1">
                            <li>• MongoDB connection issue</li>
                            <li>• No users have registered yet</li>
                            <li>• Database is empty</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

