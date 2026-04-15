'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';
import ImageUploadField from '@/components/admin/ImageUploadField';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    slug: '',
    categoryId: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await fetch('/api/subcategories');
      const data = await res.json();
      if (data.success) {
        setSubcategories(data.subcategories);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get fresh token from Firebase
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      
      if (!token) {
        alertError('Please login first');
        return;
      }

      const url = '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory
        ? { ...categoryForm, id: editingCategory.id }
        : categoryForm;

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
        alertSuccess(editingCategory ? 'Category updated!' : 'Category created!');
        setShowCategoryModal(false);
        setCategoryForm({ name: '', slug: '', description: '', image: '' });
        setEditingCategory(null);
        fetchCategories();
      } else {
        alertError(data.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alertError('Failed to save category');
    }
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get fresh token from Firebase
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      
      if (!token) {
        alertError('Please login first');
        return;
      }

      const url = '/api/subcategories';
      const method = editingSubcategory ? 'PUT' : 'POST';
      const body = editingSubcategory
        ? { ...subcategoryForm, id: editingSubcategory.id }
        : subcategoryForm;

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
        alertSuccess(editingSubcategory ? 'Subcategory updated!' : 'Subcategory created!');
        setShowSubcategoryModal(false);
        setSubcategoryForm({ name: '', slug: '', categoryId: '', description: '', image: '' });
        setEditingSubcategory(null);
        fetchSubcategories();
      } else {
        alertError(data.message || 'Failed to save subcategory');
      }
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alertError('Failed to save subcategory');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const ok = await confirmDelete('this category');
    if (!ok) return;

    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      
      if (!token) {
        alertError('Please login first');
        return;
      }

      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess('Category deleted!');
        fetchCategories();
      } else {
        alertError(data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alertError('Failed to delete category');
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    const ok = await confirmDelete('this subcategory');
    if (!ok) return;

    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      
      if (!token) {
        alertError('Please login first');
        return;
      }

      const res = await fetch(`/api/subcategories?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess('Subcategory deleted!');
        fetchSubcategories();
      } else {
        alertError(data.message || 'Failed to delete subcategory');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      alertError('Failed to delete subcategory');
    }
  };

  const openEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
    });
    setShowCategoryModal(true);
  };

  const openEditSubcategory = (subcategory: any) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory.name,
      slug: subcategory.slug,
      categoryId: subcategory.categoryId.id || subcategory.categoryId,
      description: subcategory.description || '',
      image: subcategory.image || '',
    });
    setShowSubcategoryModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-gray-600 mt-1">Manage product categories and subcategories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-gray-50 rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Categories</h2>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryForm({ name: '', slug: '', description: '', image: '' });
                setShowCategoryModal(true);
              }}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          <div className="divide-y">
            {loading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No categories found</div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditCategory(category)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subcategories */}
        <div className="bg-gray-50 rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Subcategories</h2>
            <button
              onClick={() => {
                setEditingSubcategory(null);
                setSubcategoryForm({ name: '', slug: '', categoryId: '', description: '', image: '' });
                setShowSubcategoryModal(true);
              }}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          <div className="divide-y">
            {subcategories.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No subcategories found</div>
            ) : (
              subcategories.map((sub) => (
                <div key={sub.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{sub.name}</p>
                    <p className="text-sm text-gray-600">
                      Parent: {sub.categoryId?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditSubcategory(sub)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubcategory(sub.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-50 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <ImageUploadField
                  label="Image"
                  value={categoryForm.image}
                  onChange={(val) => setCategoryForm({ ...categoryForm, image: val })}
                  editingHint={editingCategory ? 'leave blank to keep current' : undefined}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-50 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
              </h3>
              <button onClick={() => setShowSubcategoryModal(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubcategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Parent Category *</label>
                <select
                  value={subcategoryForm.categoryId}
                  onChange={(e) =>
                    setSubcategoryForm({ ...subcategoryForm, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={subcategoryForm.name}
                  onChange={(e) =>
                    setSubcategoryForm({
                      ...subcategoryForm,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  type="text"
                  value={subcategoryForm.slug}
                  onChange={(e) =>
                    setSubcategoryForm({ ...subcategoryForm, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={subcategoryForm.description}
                  onChange={(e) =>
                    setSubcategoryForm({ ...subcategoryForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <ImageUploadField
                  label="Image"
                  value={subcategoryForm.image}
                  onChange={(val) => setSubcategoryForm({ ...subcategoryForm, image: val })}
                  editingHint={editingSubcategory ? 'leave blank to keep current' : undefined}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  {editingSubcategory ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubcategoryModal(false)}
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

