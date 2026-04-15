'use client';

import { useState, useEffect } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FilterProps {
  onFilterChange: (filters: any) => void;
  categories: any[];
  brands: string[];
}

export function ProductFilter({ onFilterChange, categories, brands }: FilterProps) {
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    search: '',
    material: '',
    gender: '',
    occasion: '',
  });

  const [subcategories, setSubcategories] = useState<any[]>([]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (filters.category) {
      fetchSubcategories(filters.category);
    } else {
      setSubcategories([]);
      setFilters(prev => ({ ...prev, subcategory: '' }));
    }
  }, [filters.category]);

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/subcategories?categoryId=${categoryId}`);
      const data = await res.json();
      if (data.success) {
        setSubcategories(data.subcategories || []);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      category: '',
      subcategory: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      search: '',
      material: '',
      gender: '',
      occasion: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const materialOptions = [
    'Gold', 'Silver', 'Platinum', 'Diamond', 'Pearl', 'Gemstone', 'Stainless Steel', 'Brass'
  ];

  const genderOptions = [
    'Women', 'Men', 'Unisex', 'Kids'
  ];

  const occasionOptions = [
    'Daily Wear', 'Party', 'Wedding', 'Festival', 'Office', 'Casual', 'Formal'
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center text-gray-900">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Search Filter */}
      <div>
        <h4 className="font-medium mb-3 text-gray-900">Search</h4>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-medium mb-3 text-gray-900">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value=""
              checked={filters.category === ''}
              onChange={(e) => handleFilterChange('category', '')}
              className="mr-2 text-gray-900"
            />
            <span className="text-sm text-gray-700">All Categories</span>
          </label>
          {categories.map((category) => (
            <label key={category._id} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category._id}
                checked={filters.category === category._id}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="mr-2 text-gray-900"
              />
              <span className="text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Subcategory Filter */}
      {subcategories.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 text-gray-900">Subcategory</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="subcategory"
                value=""
                checked={filters.subcategory === ''}
                onChange={(e) => handleFilterChange('subcategory', '')}
                className="mr-2 text-gray-900"
              />
              <span className="text-sm text-gray-700">All Subcategories</span>
            </label>
            {subcategories.map((subcategory) => (
              <label key={subcategory._id} className="flex items-center">
                <input
                  type="radio"
                  name="subcategory"
                  value={subcategory._id}
                  checked={filters.subcategory === subcategory._id}
                  onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                  className="mr-2 text-gray-900"
                />
                <span className="text-sm text-gray-700">{subcategory.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Material Filter */}
      <div>
        <h4 className="font-medium mb-3 text-gray-900">Material</h4>
        <select
          value={filters.material}
          onChange={(e) => handleFilterChange('material', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="">All Materials</option>
          {materialOptions.map((material) => (
            <option key={material} value={material}>{material}</option>
          ))}
        </select>
      </div>

      {/* Gender Filter */}
      <div>
        <h4 className="font-medium mb-3 text-gray-900">Gender</h4>
        <select
          value={filters.gender}
          onChange={(e) => handleFilterChange('gender', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="">All Genders</option>
          {genderOptions.map((gender) => (
            <option key={gender} value={gender}>{gender}</option>
          ))}
        </select>
      </div>

      {/* Occasion Filter */}
      <div>
        <h4 className="font-medium mb-3 text-gray-900">Occasion</h4>
        <select
          value={filters.occasion}
          onChange={(e) => handleFilterChange('occasion', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="">All Occasions</option>
          {occasionOptions.map((occasion) => (
            <option key={occasion} value={occasion}>{occasion}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3 text-gray-900">Price Range</h4>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="text-sm"
          />
          <span className="text-gray-400">-</span>
          <Input
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            className="mr-2 text-gray-900"
          />
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
      </div>
    </div>
  );
}
