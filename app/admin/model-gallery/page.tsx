'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Upload, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { confirmDelete } from '@/lib/confirm';

interface ModelGalleryItem {
  id: string;
  modelName: string;
  image: string;
  description?: string;
  category?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function ModelGalleryAdmin() {
  const [models, setModels] = useState<ModelGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelGalleryItem | null>(null);
  const [formData, setFormData] = useState({
    modelName: '',
    image: '',
    description: '',
    category: '',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const getToken = async () => {
    const { getAuthToken } = await import('@/lib/firebase-client');
    return await getAuthToken();
  };

  const fetchModels = async () => {
    try {
      const token = await getToken();
      if (!token) { toast.error('Please login as admin'); setLoading(false); return; }

      const response = await fetch('/api/admin/model-gallery', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setModels(data.models);
      } else {
        toast.error('Failed to fetch models');
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Failed to fetch models');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.modelName || !formData.image) {
      toast.error('Model name and image are required');
      return;
    }

    try {
      const token = await getToken();
      if (!token) { toast.error('Please login as admin'); return; }

      const method = editingModel ? 'PUT' : 'POST';
      
      const response = await fetch('/api/admin/model-gallery', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingModel ? { ...formData, id: editingModel.id } : formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingModel ? 'Model updated successfully' : 'Model created successfully');
        fetchModels();
        resetForm();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving model:', error);
      toast.error('Failed to save model');
    }
  };

  const handleEdit = (model: ModelGalleryItem) => {
    setEditingModel(model);
    setFormData({
      modelName: model.modelName,
      image: model.image,
      description: model.description || '',
      category: model.category || '',
      isActive: model.isActive,
      order: model.order
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete('this model');
    if (!ok) return;

    try {
      const token = await getToken();
      if (!token) { toast.error('Please login as admin'); return; }

      const response = await fetch(`/api/admin/model-gallery?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Model deleted successfully');
        fetchModels();
      } else {
        toast.error(data.error || 'Failed to delete model');
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('Failed to delete model');
    }
  };

  const toggleActive = async (model: ModelGalleryItem) => {
    try {
      const token = await getToken();
      if (!token) { toast.error('Please login as admin'); return; }

      const response = await fetch('/api/admin/model-gallery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: model.id, isActive: !model.isActive }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Model ${!model.isActive ? 'activated' : 'deactivated'}`);
        fetchModels();
      } else {
        toast.error(data.error || 'Failed to update model');
      }
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('Failed to update model');
    }
  };

  const resetForm = () => {
    setFormData({
      modelName: '',
      image: '',
      description: '',
      category: '',
      isActive: true,
      order: 0
    });
    setEditingModel(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Model Gallery Management</h1>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
          style={{ backgroundColor: '#B76E79' }}
        >
          <Plus className="h-4 w-4" />
          Add Model
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingModel ? 'Edit Model' : 'Add New Model'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Model Name *</label>
                <Input
                  value={formData.modelName}
                  onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                  placeholder="Enter model name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL *</label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Enter image URL"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Category</option>
                  <option value="Ethnic">Ethnic</option>
                  <option value="Western">Western</option>
                  <option value="Bridal">Bridal</option>
                  <option value="Casual">Casual</option>
                  <option value="Party">Party</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="Display order"
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

              <div className="flex gap-2 pt-4">
                <Button type="submit" style={{ backgroundColor: '#B76E79' }}>
                  {editingModel ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {models.map((model) => (
          <div key={model.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-64">
              <Image
                src={model.image}
                alt={model.modelName}
                fill
                className="object-cover"
                unoptimized={model.image.startsWith('data:') || model.image.startsWith('http')}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => toggleActive(model)}
                  className={`p-1 rounded-full ${
                    model.isActive ? 'bg-green-500' : 'bg-gray-500'
                  } text-white`}
                >
                  {model.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{model.modelName}</h3>
              {model.category && (
                <p className="text-sm text-gray-600 mb-2">{model.category}</p>
              )}
              {model.description && (
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{model.description}</p>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Order: {model.order}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(model)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(model.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {models.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No models found</p>
          <Button
            onClick={() => setShowForm(true)}
            style={{ backgroundColor: '#B76E79' }}
          >
            Add First Model
          </Button>
        </div>
      )}
    </div>
  );
}