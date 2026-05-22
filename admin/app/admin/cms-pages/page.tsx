'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues with contentEditable
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

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
      if (!token) {
        console.warn('CMS: No auth token yet, retrying in 2s...');
        setTimeout(fetchPages, 2000);
        return;
      }
      const res = await fetch('/api/admin/cms-pages', {
        headers: { 'Authorization': `Bearer ${token}` }
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
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-48 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-100 rounded-xl" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6" style={{ color: '#B76E79' }} />
            CMS Pages
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage website content pages — supports rich text and direct copy-paste</p>
        </div>
        <Button
          onClick={() => { showForm ? resetForm() : setShowForm(true); }}
          style={{ backgroundColor: '#B76E79', color: '#fff' }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Page'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6 mb-8 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#B76E79' }} />
            {editingPage ? 'Edit Page' : 'Create New Page'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="shipping-policy"
                  required
                  disabled={!!editingPage}
                  className="font-mono text-sm"
                />
                <p className="text-[10px] text-gray-400 mt-1">Used in the page URL: /page/<span className="font-bold">{formData.slug || 'slug'}</span></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Shipping & Delivery Policy"
                  required
                />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
                <span className="text-[10px] text-gray-400 ml-2 font-normal">• Copy-paste from Word/Docs preserves formatting</span>
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(val) => setFormData({ ...formData, content: val })}
                placeholder="Start typing your page content, or paste formatted text from Word / Google Docs..."
                minHeight="350px"
              />
            </div>

            {/* SEO Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (SEO)</label>
                <Input
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="SEO page title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (SEO)</label>
                <Input
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="SEO page description"
                />
              </div>
            </div>

            {/* Active Toggle + Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#B76E79]"
                />
                <span className="text-sm font-medium text-gray-700">Active (visible on website)</span>
              </label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" style={{ backgroundColor: '#B76E79', color: '#fff' }}>
                  {editingPage ? 'Update Page' : 'Create Page'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Pages List */}
      <div className="space-y-3">
        {pages.map((page) => (
          <Card key={page.id} className="p-5 border border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-base font-bold text-gray-900">{page.title}</h3>
                  {page.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <Eye className="h-3 w-3" /> Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-400 border border-gray-100">
                      <EyeOff className="h-3 w-3" /> Draft
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  Slug: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-gray-600">{page.slug}</code>
                </p>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {page.content.replace(/<[^>]*>/g, '').substring(0, 180)}...
                </p>
              </div>
              <div className="flex gap-1.5 ml-4 flex-shrink-0">
                <button
                  onClick={() => handleEdit(page)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(page.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {pages.length === 0 && (
          <Card className="p-16 text-center border border-dashed border-gray-200">
            <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No CMS pages found</p>
            <p className="text-xs text-gray-400 mt-1">Create your first page to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
