'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/products/ProductCard';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSearchResults = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: query,
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        sortOrder: sortBy === 'originalPrice' ? 'asc' : 'desc',
      });
      if (categorySlug) params.set('categorySlug', categorySlug);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, currentPage, sortBy]);

  useEffect(() => {
    fetchSearchResults();
  }, [query, categorySlug, currentPage, sortBy, fetchSearchResults]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb items={[{ label: 'Search Results' }]} />
          
          <div className="mt-4 flex items-center space-x-3">
            <Search className="h-6 w-6 text-gray-400" />
            <h1 className="elegant-heading-large">Search Results</h1>
          </div>
          
          <p className="elegant-subheading">
            {loading ? 'Searching...' : (query || categorySlug) ? `Found ${products.length} results${query ? ` for "${query}"` : ''}${categorySlug ? ` in ${categorySlug}` : ''}` : 'Enter a search term to find products'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sort and Filter Bar */}
        {(query || categorySlug) && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SlidersHorizontal className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {products.length} Products Found
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="originalPrice">Price: Low to High</option>
                  <option value="name">Name: A to Z</option>
                  <option value="averageRating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : !(query || categorySlug) ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Start Your Search</h3>
            <p className="text-gray-500">
              Use the search bar above to find products by name, category, material, or SKU
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-500 mb-4">
              We couldn't find any products matching "{query}"
            </p>
            <div className="text-sm text-gray-400">
              <p>Try searching for:</p>
              <ul className="mt-2 space-y-1">
                <li>• Different keywords or spellings</li>
                <li>• Product categories (rings, necklaces, earrings)</li>
                <li>• Materials (gold, silver, diamond)</li>
                <li>• Product codes or SKUs</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === i + 1
                          ? 'text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                      style={currentPage === i + 1 ? { backgroundColor: '#B76E79' } : {}}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
