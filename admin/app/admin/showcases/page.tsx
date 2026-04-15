'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';
import ImageUploadField from '@/components/admin/ImageUploadField';

export default function ShowcasesAdmin() {
  const [showcases, setShowcases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingShowcase, setEditingShowcase] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchShowcases();
  }, []);

  const fetchShowcases = async () => {
    try {
      const res = await fetch('/api/admin/showcases');
      const data = await res.json();
      if (data.success) {
        setShowcases(data.showcases);
      }
    } catch (error) {
      console.error('Error fetching showcases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      alertError('Please provide an image URL or upload a file');
      return;
    }

    try {
      const url = '/api/admin/showcases';
      const method = editingShowcase ? 'PUT' : 'POST';
      const body = editingShowcase ? { ...formData, id: editingShowcase.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      if (data.success) {
        alertSuccess(editingShowcase ? 'Showcase updated successfully' : 'Showcase created successfully');
        fetchShowcases();
        resetForm();
      } else {
        alertError('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving showcase:', error);
      alertError('Failed to save showcase');
    }
  };

  const handleEdit = (showcase: any) => {
    setEditingShowcase(showcase);
    setFormData({
      title: showcase.title,
      subtitle: showcase.subtitle,
      image: showcase.image,
      link: showcase.link,
      order: showcase.order,
      isActive: showcase.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete('this showcase');
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/showcases?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      
      if (data.success) {
        alertSuccess('Showcase deleted successfully');
        fetchShowcases();
      } else {
        alertError('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting showcase:', error);
      alertError('Failed to delete showcase');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      link: '',
      order: 0,
      isActive: true,
    });
    setEditingShowcase(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">New Arrivals Showcase</h1>
          <p className="text-gray-600 mt-1">Manage homepage showcase images (8 items recommended)</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Showcase'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingShowcase ? 'Edit Showcase' : 'Create New Showcase'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Diamond Necklaces"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Elegant & Timeless"
                  required
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <ImageUploadField
                label="Image"
                value={formData.image}
                onChange={(val) => setFormData({ ...formData, image: val })}
                required={!editingShowcase}
                editingHint={editingShowcase ? 'leave blank to keep current' : undefined}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Link</label>
                <Input
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/products?category=necklaces"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  placeholder="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={!formData.image} style={{ backgroundColor: '#B76E79', color: '#fff' }}>
                {editingShowcase ? 'Update Showcase' : 'Create Showcase'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {showcases.map((showcase) => (
          <Card key={showcase.id} className="overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              <Image
                src={showcase.image || '/placeholder.svg'}
                alt={showcase.title}
                fill
                className="object-cover"
                unoptimized={showcase.image?.startsWith('data:')}
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                {showcase.isActive ? (
                  <div className="bg-green-500 text-white p-1 rounded">
                    <Eye className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="bg-gray-500 text-white p-1 rounded">
                    <EyeOff className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <h3 className="text-white font-semibold text-sm">{showcase.title}</h3>
                <p className="text-white/90 text-xs">{showcase.subtitle}</p>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Order: {showcase.order}</span>
                <span className="truncate ml-2">{showcase.link}</span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(showcase)} className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(showcase.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {showcases.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No showcases found. Create your first showcase!</p>
            <p className="text-sm text-gray-400 mt-2">Recommended: 8 items for homepage display</p>
          </Card>
        )}
      </div>

      {showcases.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload high-quality images (1200x1500px recommended)</li>
            <li>• Keep titles short and descriptive</li>
            <li>• Order determines display sequence (0 = first)</li>
            <li>• Link to relevant product categories or collections</li>
            <li>• 8 items work best for 4-row layout (2 per row)</li>
            <li>• Images are stored as base64 in database</li>
          </ul>
        </div>
      )}
    </div>
  );
}

