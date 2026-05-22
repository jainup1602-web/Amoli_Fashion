'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, X, Plus, Layout } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';
import ImageUploadField from '@/components/admin/ImageUploadField';

const getToken = async () => {
  const { getAuthToken } = await import('@/lib/firebase-client');
  return await getAuthToken();
};

const SWATCHES = ['#1A1A1A', '#FDFCF0', '#000000', '#ffffff', '#B76E79'];

export default function SectionsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);

  const emptyForm = {
    location: '',
    title: '',
    subtitle: '',
    description: '',
    image: '',
    buttonText: '',
    buttonLink: '',
    backgroundColor: '#1A1A1A',
    isActive: true,
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/sections', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSections(data.sections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      alertError('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        alertSuccess(editingSection ? 'Section updated!' : 'Section created!');
        setShowModal(false);
        fetchSections();
      } else {
        alertError(data.message || 'Error saving section');
      }
    } catch (error) {
      alertError('Error saving section');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete('Are you sure you want to delete this section?');
    if (!ok) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/sections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        alertSuccess('Section deleted');
        fetchSections();
      }
    } catch (error) {
      alertError('Error deleting section');
    }
  };

  const openEdit = (section: any) => {
    setEditingSection(section);
    setFormData({
      location: section.location,
      title: section.title || '',
      subtitle: section.subtitle || '',
      description: section.description || '',
      image: section.image || '',
      buttonText: section.buttonText || '',
      buttonLink: section.buttonLink || '',
      backgroundColor: section.backgroundColor || '#1A1A1A',
      isActive: section.isActive,
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingSection(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layout className="h-8 w-8" /> Dynamic Sections
          </h1>
          <p className="text-gray-600 mt-1">Manage text and banners across the website</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Section
        </button>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : sections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No sections found. Add your first one!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Background</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <tr key={section.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm text-blue-600">{section.location}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs text-gray-400">{section.subtitle}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border" 
                          style={{ backgroundColor: section.backgroundColor }}
                        />
                        {section.image && <span className="text-xs text-gray-500">(Has Image)</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${section.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {section.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(section)} className="text-blue-600 hover:text-blue-800">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(section.id)} className="text-red-600 hover:text-red-800">
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-xl font-bold">{editingSection ? 'Edit Section' : 'Add Section'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Location Key (e.g., products_hero) *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black"
                  placeholder="products_hero"
                  required
                  disabled={!!editingSection}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black h-24"
                />
              </div>

              <div>
                <ImageUploadField 
                  label="Background Image (optional)" 
                  value={formData.image} 
                  onChange={(val) => setFormData({ ...formData, image: val })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Background Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="h-10 w-10 p-1 border rounded"
                    />
                    <div className="flex gap-1">
                      {SWATCHES.map(c => (
                        <button 
                          key={c} 
                          type="button" 
                          onClick={() => setFormData({ ...formData, backgroundColor: c })}
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">Is Active</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="w-full py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  {editingSection ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
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
