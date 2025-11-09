'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/ui/Headers';
import ProductCard from '@/components/ui/ProductCard';
import ProductFilter from '@/components/ui/ProductFilter';
import { Button } from '@/components/ui/Button';
import { Filter, Grid, List, Sparkles, Truck, Shield, RefreshCw, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import BaseUrl from '@/lib/Base_URL';



interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  brand: string;
  rating: number;
  category: string | { _id: string; name: string };
  sizes?: Array<{ size: string; stock: number }>;
  colors?: Array<{ name: string; code: string }>;
  inStock: boolean;
  featured: boolean;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('${BaseUrl}/api/products');
      setProducts(response.data.products);
      setFilteredProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/users/wishlist`);
      const wishlistIds = response.data.map((product: Product) => product._id);
      setWishlist(wishlistIds);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const getCategoryName = (category: string | { _id: string; name: string }): string => {
    if (typeof category === 'string') {
      return category;
    }
    return category?.name || '';
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (filters.category) {
      filtered = filtered.filter(product => {
        const categoryName = getCategoryName(product.category);
        return categoryName.toLowerCase().includes(filters.category.toLowerCase());
      });
    }

    if (filters.brand) {
      filtered = filtered.filter(product => 
        product.brand.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= Number(filters.maxPrice));
    }

    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(product =>
        product.sizes?.some(size => filters.sizes.includes(size.size))
      );
    }

    setFilteredProducts(filtered);
  };

  const handleWishlistToggle = async (productId: string) => {
    if (!user) return;
    
    try {
      await axios.post(`${BaseUrl}/api/users/wishlist/${productId}`);
      setWishlist(prev => {
        if (prev.includes(productId)) {
          return prev.filter(id => id !== productId);
        } else {
          return [...prev, productId];
        }
      });
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const categories = [
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
    { label: 'Kids', value: 'kids' }
  ];

  const brands = [
    { label: 'Nike', value: 'nike' },
    { label: 'Adidas', value: 'adidas' },
    { label: 'Puma', value: 'puma' },
    { label: 'Zara', value: 'zara' },
    { label: 'H&M', value: 'hm' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Style for Everyone
          </h1>
          <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
            Discover the latest fashion trends at amazing prices. Free shipping on orders above ₹999!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button size="lg" className=" text-pink-600 hover:bg-gray-100 font-semibold text-base md:text-lg px-6 md:px-8">
              Shop Now
            </Button>
            <Button size="lg" variant="outline" className="text-gray-900 hover:bg-white hover:text-pink-600 text-base md:text-lg px-6 md:px-8">
              New Arrivals
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-6 md:py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 text-center">
            <div className="flex flex-col items-center">
              <Truck className="h-6 w-6 md:h-8 md:w-8 text-pink-600 mb-2" />
              <h3 className="font-semibold text-sm md:text-base mb-1">Free Delivery</h3>
              <p className="text-xs md:text-sm text-gray-600">On orders above ₹999</p>
            </div>
            <div className="flex flex-col items-center">
              <RefreshCw className="h-6 w-6 md:h-8 md:w-8 text-pink-600 mb-2" />
              <h3 className="font-semibold text-sm md:text-base mb-1">Easy Returns</h3>
              <p className="text-xs md:text-sm text-gray-600">30-day return policy</p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-pink-600 mb-2" />
              <h3 className="font-semibold text-sm md:text-base mb-1">Secure Payment</h3>
              <p className="text-xs md:text-sm text-gray-600">100% secure payment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col xl:flex-row gap-6 md:gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden xl:block w-72 shrink-0">
            <div className="sticky top-24">
              <ProductFilter 
                categories={categories}
                brands={brands}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Products Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3 md:gap-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">New Arrivals</h2>
                <p className="text-gray-600 mt-1 text-sm md:text-base">{filteredProducts.length} products found</p>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Mobile Filter Button */}
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 xl:hidden flex-1 md:flex-none"
                  onClick={() => setShowFilters(true)}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
                
                {/* View Toggle */}
                <div className="flex border rounded-lg shrink-0">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none px-3"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid - Optimized Responsive Layout */}
            {filteredProducts.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6`
                  : "grid grid-cols-1 gap-4 md:gap-6"
              }>
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    viewMode={viewMode}
                    isInWishlist={wishlist.includes(product._id)}
                    onWishlistToggle={handleWishlistToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <Sparkles className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4 text-sm md:text-base">Try adjusting your filters to see more products.</p>
                <Button onClick={() => setFilters({})} variant="outline" size="sm" className="text-sm">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Load More */}
            {filteredProducts.length > 0 && (
              <div className="flex justify-center mt-8 md:mt-12">
                <Button variant="outline" size="lg" className="text-sm md:text-base">
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 xl:hidden">
          <div className="fixed inset-y-0 left-0 max-w-sm w-full bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(false)}
                className="hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <ProductFilter 
                categories={categories}
                brands={brands}
                onFilterChange={(newFilters) => {
                  handleFilterChange(newFilters);
                  setShowFilters(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}