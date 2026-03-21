'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';

const getToken = async () => {
  const { getAuthToken } = await import('@/lib/firebase-client');
  return await getAuthToken();
};

export default function CmsPagesAdmin() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true,
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/cms-pages', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setPages(data.pages);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const method = editingPage ? 'PUT' : 'POST';
      const body = editingPage ? { ...formData, id: editingPage.id } : formData;

      const res = await fetch('/api/admin/cms-pages', {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess(editingPage ? 'Page updated!' : 'Page created!');
        fetchPages();
        resetForm();
      } else {
        alertError('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alertError('Failed to save page');
    }
  };

  const handleEdit = (page: any) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      isActive: page.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete('this page');
    if (!ok) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/cms-pages?id=${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        alertSuccess('Page deleted!');
        fetchPages();
      } else {
        alertError('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      alertError('Failed to delete page');
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      isActive: true,
    });
    setEditingPage(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">CMS Pages</h1>
        <Button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#B76E79', color: '#fff' }}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Page'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingPage ? 'Edit Page' : 'Create New Page'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="about-us"
                  required
                  disabled={!!editingPage}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="About Us"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content (HTML supported)</label>
              <textarea
                className="w-full border rounded-lg p-3 min-h-[300px] font-mono text-sm"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="<h2>Welcome</h2><p>Content here...</p>"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <Input
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="SEO Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <Input
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="SEO Description"
                />
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
              <Button type="submit" style={{ backgroundColor: '#B76E79', color: '#fff' }}>
                {editingPage ? 'Update Page' : 'Create Page'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {pages.map((page) => (
          <Card key={page.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold">{page.title}</h3>
                  {page.isActive ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Slug: <code className="bg-gray-100 px-2 py-1 rounded">{page.slug}</code>
                </p>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {page.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => handleEdit(page)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(page.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {pages.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No CMS pages found. Create your first page!</p>
          </Card>
        )}
      </div>
    </div>
  );
}

