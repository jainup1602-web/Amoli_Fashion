'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import toast from 'react-hot-toast';

interface MarqueeItem {
  id: string;
  text: string;
  categoryId?: string;
  filterSlug?: string;
  hoverImage?: string;
  row: number;
  order: number;
  isActive: boolean;
}

export default function AdminMarqueePage() {
  const [items, setItems] = useState<MarqueeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    text: '',
    categoryId: '',
    filterSlug: '',
    hoverImage: '',
    row: 1,
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/marquee', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch marquee items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      toast.error('Text is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `/api/admin/marquee/${editingId}` : '/api/admin/marquee';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'Item updated!' : 'Item created!');
        fetchItems();
        resetForm();
      } else {
        toast.error(data.error || 'Failed to save item');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save item');
    }
  };

  const handleEdit = (item: MarqueeItem) => {
    setEditingId(item.id);
    setFormData({
      text: item.text,
      categoryId: item.categoryId || '',
      filterSlug: item.filterSlug || '',
      hoverImage: item.hoverImage || '',
      row: item.row,
      order: item.order,
      isActive: item.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this marquee item?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/marquee/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Item deleted');
        fetchItems();
      } else {
        toast.error('Failed to delete item');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete item');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/marquee/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Item ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchItems();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      text: '',
      categoryId: '',
      filterSlug: '',
      hoverImage: '',
      row: 1,
      order: 0,
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const row1Items = items.filter(item => item.row === 1);
  const row2Items = items.filter(item => item.row === 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-jewelry"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gold/20 pb-6">
        <div>
          <span className="text-gold tracking-[0.2em] text-xs uppercase mb-2 block font-elegant">Content</span>
          <h1 className="text-3xl font-serif text-[#1C1C1C]">Marquee Items</h1>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 md:mt-0 rounded-none bg-gold hover:bg-gold/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6 border border-gold/10 shadow-sm rounded-none">
          <h2 className="text-lg font-serif text-[#1C1C1C] mb-4">
            {editingId ? 'Edit Item' : 'New Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text *
                </label>
                <Input
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="e.g., Gemstone Jewellery"
                  className="rounded-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Slug (for URL)
                </label>
                <Input
                  value={formData.filterSlug}
                  onChange={(e) => setFormData({ ...formData, filterSlug: e.target.value })}
                  placeholder="e.g., gemstone-jewellery"
                  className="rounded-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Row
                </label>
                <select
                  value={formData.row}
                  onChange={(e) => setFormData({ ...formData, row: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-none px-3 py-2"
                >
                  <option value={1}>Row 1 (Right to Left)</option>
                  <option value={2}>Row 2 (Left to Right)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="rounded-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hover Image
              </label>
              <ImageUploadField
                value={formData.hoverImage}
                onChange={(url) => setFormData({ ...formData, hoverImage: url })}
                label="Upload hover image (200x200px recommended)"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="rounded-none bg-gold hover:bg-gold/90 text-white">
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="rounded-none"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Row 1 Items */}
      <Card className="p-6 border border-gold/10 shadow-sm rounded-none">
        <h2 className="text-base font-serif text-[#1C1C1C] mb-4 flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gold" />
          Row 1 (Right to Left) - {row1Items.length} items
        </h2>
        <div className="space-y-2">
          {row1Items.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No items in row 1</p>
          ) : (
            row1Items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border border-gray-100 hover:border-gold/30 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-[#1C1C1C]">{item.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Order: {item.order} | Slug: {item.filterSlug || 'N/A'}
                  </p>
                </div>
                {item.hoverImage && (
                  <div className="w-12 h-12 relative bg-gray-100 flex-shrink-0">
                    <img src={item.hoverImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(item.id, item.isActive)}
                    className="h-8 w-8 p-0"
                  >
                    {item.isActive ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(item)}
                    className="h-8 w-8 p-0 text-blue-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 p-0 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Row 2 Items */}
      <Card className="p-6 border border-gold/10 shadow-sm rounded-none">
        <h2 className="text-base font-serif text-[#1C1C1C] mb-4 flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gold" />
          Row 2 (Left to Right) - {row2Items.length} items
        </h2>
        <div className="space-y-2">
          {row2Items.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No items in row 2</p>
          ) : (
            row2Items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border border-gray-100 hover:border-gold/30 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-[#1C1C1C]">{item.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Order: {item.order} | Slug: {item.filterSlug || 'N/A'}
                  </p>
                </div>
                {item.hoverImage && (
                  <div className="w-12 h-12 relative bg-gray-100 flex-shrink-0">
                    <img src={item.hoverImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(item.id, item.isActive)}
                    className="h-8 w-8 p-0"
                  >
                    {item.isActive ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(item)}
                    className="h-8 w-8 p-0 text-blue-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 p-0 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
