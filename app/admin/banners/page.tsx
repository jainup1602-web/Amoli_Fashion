'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    link: '',
    order: '',
    isActive: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      
      if (!token) {
        console.error('No token available - Please login as admin');
        setLoading(false);
        alertError('Please login as admin to manage banners');
        return;
      }

      const res = await fetch('/api/admin/banners', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners);
      } else {
        console.error('API Error:', data.message);
        if (data.message === 'Unauthorized') {
          alertError('Admin access required. Please login as admin.');
        }
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      alertError('Error loading banners. Please check your admin access.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      
      if (!token) {
        alertError('Please login first');
        return;
      }

      const url = '/api/admin/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const imageToSend = formData.image || (editingBanner ? editingBanner.image : '');

      if (!imageToSend) {
        alertError('Please select an image');
        return;
      }

      const body = editingBanner
        ? { ...formData, image: imageToSend, id: editingBanner.id }
        : { ...formData, image: imageToSend };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess(editingBanner ? 'Banner updated!' : 'Banner created!');
        setShowModal(false);
        resetForm();
        fetchBanners();
      } else {
        alertError(data.message || 'Failed to save banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      alertError('Failed to save banner');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete('this banner');
    if (!ok) return;

    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      
      if (!token) {
        alertError('Please login first');
        return;
      }

      const res = await fetch(`/api/admin/banners?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess('Banner deleted!');
        fetchBanners();
      } else {
        alertError(data.message || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      alertError('Failed to delete banner');
    }
  };

  const openEdit = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image: banner.image,
      link: banner.link || '',
      order: banner.order.toString(),
      isActive: banner.isActive,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      link: '',
      order: '',
      isActive: true,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Banner Management</h1>
          <p className="text-gray-600 mt-1">Manage homepage banners and promotional sliders</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Banner
        </button>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            Loading banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No banners found</p>
            <p className="text-sm">Make sure you're logged in as admin to manage banners</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Preview</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Link</th>
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-32 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{banner.title}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {banner.link || '-'}
                      </p>
                    </td>
                    <td className="py-3 px-4">{banner.order}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          banner.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(banner)}
                          className="text-blue-600 hover:underline"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-600 hover:underline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-50 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingBanner ? 'Edit Banner' : 'Add Banner'}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subtitle <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g. Up to 50% Off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md resize-none"
                  rows={2}
                  placeholder="Short description shown on the banner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Image {editingBanner ? '(naya select karo ya purana rahega)' : '*'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required={!editingBanner}
                />
                {/* Current/Preview image */}
                {(formData.image || (editingBanner?.image)) && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      {formData.image && formData.image !== editingBanner?.image ? 'New image:' : 'Current image:'}
                    </p>
                    <img
                      src={formData.image || editingBanner?.image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Link (Optional)</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  min="0"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  {editingBanner ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
