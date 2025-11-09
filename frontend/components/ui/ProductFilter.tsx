'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface ProductFilterProps {
  categories: FilterOption[];
  brands: FilterOption[];
  onFilterChange: (filters: any) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ 
  categories, 
  brands, 
  onFilterChange 
}) => {
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    category: '',
    brand: '',
    sizes: [] as string[]
  });
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);

  const sizes = [
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'XXL', value: 'XXL' }
  ];

  // Apply filters automatically when they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
  };

  const handleBrandChange = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      brand: prev.brand === brand ? '' : brand
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const clearFilter = (filterType: string, value?: string) => {
    setFilters(prev => {
      if (filterType === 'minPrice') return { ...prev, minPrice: '' };
      if (filterType === 'maxPrice') return { ...prev, maxPrice: '' };
      if (filterType === 'category') return { ...prev, category: '' };
      if (filterType === 'brand') return { ...prev, brand: '' };
      if (filterType === 'sizes' && value) {
        return { ...prev, sizes: prev.sizes.filter(s => s !== value) };
      }
      if (filterType === 'all') {
        return { minPrice: '', maxPrice: '', category: '', brand: '', sizes: [] };
      }
      return prev;
    });
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.category || filters.brand || filters.sizes.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => clearFilter('all')} className="text-pink-600 hover:text-pink-700">
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.minPrice && (
            <span className="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-800 text-sm rounded-full">
              Min: ₹{filters.minPrice}
              <button onClick={() => clearFilter('minPrice')} className="ml-1 hover:text-pink-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.maxPrice && (
            <span className="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-800 text-sm rounded-full">
              Max: ₹{filters.maxPrice}
              <button onClick={() => clearFilter('maxPrice')} className="ml-1 hover:text-pink-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-800 text-sm rounded-full">
              {categories.find(c => c.value === filters.category)?.label}
              <button onClick={() => clearFilter('category')} className="ml-1 hover:text-pink-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.brand && (
            <span className="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-800 text-sm rounded-full">
              {filters.brand}
              <button onClick={() => clearFilter('brand')} className="ml-1 hover:text-pink-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.sizes.map(size => (
            <span key={size} className="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-800 text-sm rounded-full">
              {size}
              <button onClick={() => clearFilter('sizes', size)} className="ml-1 hover:text-pink-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="flex items-center justify-between w-full font-semibold mb-3"
        >
          <span>Categories</span>
          {isCategoryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {isCategoryOpen && (
          <div className="space-y-2">
            {categories.map(category => (
              <label key={category.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={filters.category === category.value}
                  onChange={() => handleCategoryChange(category.value)}
                  className="text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm">{category.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div>
        <button
          onClick={() => setIsBrandOpen(!isBrandOpen)}
          className="flex items-center justify-between w-full font-semibold mb-3"
        >
          <span>Brands</span>
          {isBrandOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {isBrandOpen && (
          <div className="space-y-2">
            {brands.map(brand => (
              <label key={brand.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="brand"
                  value={brand.value}
                  checked={filters.brand === brand.value}
                  onChange={() => handleBrandChange(brand.value)}
                  className="text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm capitalize">{brand.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sizes */}
      <div>
        <h3 className="font-semibold mb-3">Sizes</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map(size => (
            <button
              key={size.value}
              onClick={() => handleSizeToggle(size.value)}
              className={`px-3 py-2 border rounded-md text-sm transition-colors ${
                filters.sizes.includes(size.value)
                  ? 'bg-pink-600 text-white border-pink-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-pink-600'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;