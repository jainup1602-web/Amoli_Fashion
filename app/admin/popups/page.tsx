'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Star, Upload } from 'lucide-react';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';

const getToken = async () => {
  const { getAuthToken } = await import('@/lib/firebase-client');
  return await getAuthToken();
};

interface Popup {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  offerText?: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  showDelay: number;
  createdAt: string;
  updatedAt: string;
}

export default function PopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');
  const imageFileRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    offerText: '',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    isActive: true,
    showDelay: 2000
  });

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/popups', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.success) setPopups(data.popups);
    } catch (error) {
      console.error('Error fetching popups:', error);
    } finally {
      setListLoading(false);
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFormData(f => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      const method = editingPopup ? 'PUT' : 'POST';
      const payload = editingPopup ? { ...formData, id: editingPopup.id } : formData;

      const response = await fetch('/api/admin/popups', {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        await fetchPopups();
        resetForm();
        alertSuccess(editingPopup ? 'Popup updated!' : 'Popup created!');
      } else {
        alertError(data.error || 'Failed to save popup');
      }
    } catch (error) {
      console.error('Error saving popup:', error);
      alertError('Failed to save popup');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (popup: Popup) => {
    setEditingPopup(popup);
    setFormData({
      title: popup.title,
      subtitle: popup.subtitle || '',
      description: popup.description || '',
      image: popup.image || '',
      offerText: popup.offerText || '',
      buttonText: popup.buttonText,
      buttonLink: popup.buttonLink,
      isActive: popup.isActive,
      showDelay: popup.showDelay
    });
    setImageMode('url');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete('this popup');
    if (!ok) return;
    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/popups?id=${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.success) {
        await fetchPopups();
        alertSuccess('Popup deleted!');
      } else {
        alertError(data.error || 'Failed to delete popup');
      }
    } catch (error) {
      console.error('Error deleting popup:', error);
      alertError('Failed to delete popup');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      offerText: '',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      isActive: true,
      showDelay: 2000
    });
    setEditingPopup(null);
    setImageMode('url');
    setShowForm(false);
  };

  if (listLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Popup Management</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2" style={{ backgroundColor: '#043927', color: '#fff' }}>
          <Plus className="h-4 w-4" />
          Add Popup
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
          <div className="p-6 overflow-y-auto flex-1">
            <h2 className="text-xl font-bold mb-4">
              {editingPopup ? 'Edit Popup' : 'Add Popup'}
            </h2>

            <form id="popup-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Special Offer!"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle</label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Limited Time Offer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Get amazing discounts on all jewelry items..."
                  className="w-full p-2 border rounded h-20 text-sm"
                />
              </div>

              {/* Image field with URL / File toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">Image</label>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-2 py-1 rounded border ${imageMode === 'url' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 text-gray-600'}`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('file')}
                      className={`px-2 py-1 rounded border ${imageMode === 'file' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 text-gray-600'}`}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                {imageMode === 'url' ? (
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/offer-image.jpg"
                  />
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => imageFileRef.current?.click()}
                  >
                    {formData.image && formData.image.startsWith('data:') ? (
                      <img src={formData.image} alt="preview" className="h-24 mx-auto object-contain rounded" />
                    ) : (
                      <div className="text-gray-500 text-sm">
                        <Upload className="h-6 w-6 mx-auto mb-1" />
                        Click to upload image
                      </div>
                    )}
                    <input ref={imageFileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Offer Text</label>
                <Input
                  value={formData.offerText}
                  onChange={(e) => setFormData({ ...formData, offerText: e.target.value })}
                  placeholder="Shop for ₹1000+ & Get 10% EXTRA Discount"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Button Text</label>
                  <Input
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Button Link</label>
                  <Input
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="/products"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Show Delay (ms)</label>
                <Input
                  type="number"
                  value={formData.showDelay}
                  onChange={(e) => setFormData({ ...formData, showDelay: parseInt(e.target.value) })}
                  placeholder="2000"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
              </div>

            </form>
          </div>

          {/* Sticky action buttons outside scroll area */}
          <div className="flex gap-2 p-4 border-t bg-white rounded-b-lg">
            <Button type="submit" form="popup-form" disabled={saving} style={{ backgroundColor: '#043927', color: '#fff' }}>
              {saving ? 'Saving...' : (editingPopup ? 'Update' : 'Create')}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
          </div>
        </div>
      )}

      {/* Popups List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Popups ({popups.length})</h2>
        </div>

        {popups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No popups found. Create your first popup!</p>
          </div>
        ) : (
          <div className="divide-y">
            {popups.map((popup) => (
              <div key={popup.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                    {popup.image ? (
                      <img src={popup.image} alt={popup.title} className="w-full h-full object-cover" />
                    ) : (
                      <Star className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{popup.title}</h3>
                    {popup.subtitle && <p className="text-sm text-gray-500">{popup.subtitle}</p>}
                    {popup.offerText && <p className="text-sm text-green-600 font-medium">{popup.offerText}</p>}
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-400">Delay: {popup.showDelay}ms</span>
                      <span className={`text-xs px-2 py-1 rounded ${popup.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {popup.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(popup)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(popup.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
