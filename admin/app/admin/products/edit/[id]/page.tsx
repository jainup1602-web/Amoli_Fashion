'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Upload, X } from 'lucide-react';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [productSlug, setProductSlug] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    specialPrice: '',
    stock: '',
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      // Fetch by ID using admin products list, find matching product
      const res = await fetch('/api/products?limit=1000');
      const data = await res.json();
      if (data.success) {
        const product = data.products.find((p: any) => p.id === params.id);
        if (product) {
          setProductSlug(product.slug);
          setFormData({
            name: product.name || '',
            slug: product.slug || '',
            sku: product.sku || '',
            description: product.description || '',
            category: product.categoryId || '',
            subcategory: product.subcategoryId || '',
            price: String(product.originalPrice || ''),
            specialPrice: String(product.specialPrice || ''),
            stock: String(product.stock || ''),
            isActive: product.isActive ?? true,
            isFeatured: product.isFeatured ?? false,
          });
          setImages(Array.isArray(product.images) ? product.images : []);
          if (product.categoryId) fetchSubcategories(product.categoryId);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setFetching(false);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/categories/${categoryId}`);
      const data = await res.json();
      if (data.success) setSubcategories(data.subcategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData({ ...formData, category: categoryId, subcategory: '' });
    if (categoryId) fetchSubcategories(categoryId);
    else setSubcategories([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => setImages((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      if (!token) { alertError('Please login first'); setLoading(false); return; }

      const productData = {
        name: formData.name,
        slug: formData.slug,
        sku: formData.sku,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        price: parseFloat(formData.price),
        specialPrice: formData.specialPrice ? parseFloat(formData.specialPrice) : undefined,
        stock: parseInt(formData.stock),
        images,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      };

      const res = await fetch(`/api/products/${productSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess('Product updated successfully!');
        router.push('/admin/products');
      } else {
        alertError(data.error || data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alertError('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirmDelete('this product');
    if (!ok) return;
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      if (!token) { alertError('Please login first'); return; }

      const res = await fetch(`/api/admin/products/${productSlug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess('Product deleted successfully');
        router.push('/admin/products');
      } else {
        alertError(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alertError('Failed to delete product');
    }
  };

  if (fetching) {
    return <div className="text-center py-12">Loading product...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products" className="text-blue-600 hover:underline mb-2 inline-block">← Back to Products</Link>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <div className="bg-gray-50 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU *</label>
                <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full px-3 py-2 border rounded-md" required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select value={formData.category} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full px-3 py-2 border rounded-md" required>
                <option value="">Select Category</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subcategory</label>
              <select value={formData.subcategory} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} className="w-full px-3 py-2 border rounded-md" disabled={!formData.category}>
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-md" required />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Original Price *</label>
                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 border rounded-md" min="0" step="0.01" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Special Price</label>
                <input type="number" value={formData.specialPrice} onChange={(e) => setFormData({ ...formData, specialPrice: e.target.value })} className="w-full px-3 py-2 border rounded-md" min="0" step="0.01" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
            <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full px-3 py-2 border rounded-md w-48" min="0" required />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Product Images</h2>
            <div className="border-2 border-dashed rounded-lg p-6">
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="product-images" />
              <label htmlFor="product-images" className="cursor-pointer block text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Click to upload images</p>
              </label>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt="" className="w-full h-24 object-cover rounded" />
                    <button type="button" onClick={() => setImages(images.filter((_, i) => i !== index))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm font-medium">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm font-medium">Featured</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium disabled:bg-gray-400">
              {loading ? 'Updating...' : 'Update Product'}
            </button>
            <button type="button" onClick={handleDelete} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium">
              Delete Product
            </button>
            <Link href="/admin/products" className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
