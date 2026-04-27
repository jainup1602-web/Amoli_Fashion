'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    const ok = await confirmDelete('this product');
    if (!ok) return;

    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();

      if (!token) {
        alertError('Please login first');
        return;
      }

      const res = await fetch(`/api/admin/products/${slug}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        alertSuccess('Product deleted successfully');
        fetchProducts();
      } else {
        alertError(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alertError('Failed to delete product');
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gold/20 pb-6">
        <div>
          <span className="text-gold tracking-[0.2em] text-xs uppercase mb-2 block font-elegant">Catalog</span>
          <h1 className="text-3xl font-serif text-[#1C1C1C]">Products Management</h1>
        </div>
        <Link href="/admin/products/add" className="mt-4 md:mt-0">
          <Button className="bg-gold hover:bg-gold/90 text-white rounded-none border-none tracking-[0.2em] uppercase text-xs px-6 transition-luxury">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card className="p-8 border border-gold/10 shadow-sm rounded-none bg-gray-50">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 rounded-none border-gold/30 focus-visible:ring-gold focus-visible:ring-offset-0 font-light"
            />
          </div>
          <div className="text-sm font-elegant tracking-widest text-gray-400 uppercase">
            {filteredProducts.length} Items
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No products found. <Link href="/admin/products/add" className="text-blue-600 hover:underline">Add your first product</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gold/20 text-xs font-elegant tracking-widest uppercase text-gray-500">
                  <th className="py-4 px-4 font-normal">Image</th>
                  <th className="py-4 px-4 font-normal">Product</th>
                  <th className="py-4 px-4 font-normal">SKU</th>
                  <th className="py-4 px-4 font-normal">Price</th>
                  <th className="py-4 px-4 font-normal">Stock</th>
                  <th className="py-4 px-4 font-normal">Status</th>
                  <th className="py-4 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FDFBF7] transition-colors group">
                    <td className="py-4 px-4">
                      {product.images?.[0] ? (
                        <div className="w-14 h-14 relative border border-gold/10">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-[#FDFBF7] border border-gold/10 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gold/30" />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-serif text-[#1C1C1C] text-lg leading-tight line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-light">{product.categoryId?.name || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-light text-gray-600">{product.sku || '-'}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        {product.specialPrice ? (
                          <>
                            <span className="text-sm font-medium text-[#1C1C1C]">₹{product.specialPrice}</span>
                            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice || product.price}</span>
                          </>
                        ) : (
                          <span className="text-sm font-medium text-[#1C1C1C]">₹{product.originalPrice || product.price}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-sm ${product.stock < 10 ? 'text-red-600 font-medium bg-red-50 px-2 py-0.5 border border-red-100' : 'text-gray-600 font-light'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 text-[10px] uppercase tracking-widest font-medium border ${product.isActive
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/products/edit/${product.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gold hover:text-gold hover:bg-gold/10 rounded-none border border-transparent hover:border-gold/30">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.slug)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-none border border-transparent hover:border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

