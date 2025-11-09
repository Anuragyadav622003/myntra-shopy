'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/ui/Headers';
import { Button } from '@/components/ui/Button';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
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
  sizes?: Array<{ size: string; stock: number }>;
  colors?: Array<{ name: string; code: string }>;
  category: {
    _id: string;
    name: string;
  };
}

export default function Wishlist() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/users/wishlist`);
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await axios.post(`${BaseUrl}/api/users/wishlist/${productId}`); // Fixed URL
      setWishlist(wishlist.filter(item => item._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const addToCart = (product: Product) => {
    addItem({
      product: product._id,
      name: product.name,
      image: product.images[0] || '/images/placeholder.jpg',
      price: product.price,
      size: product.sizes?.[0]?.size || 'M', // Default size
      color: product.colors?.[0]?.name || 'Default', // Default color
      quantity: 1
    });
    toast.success('Added to cart!');
  };

  const moveAllToCart = () => {
    wishlist.forEach(product => {
      addToCart(product);
    });
    toast.success('All items moved to cart!');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
            <p className="text-gray-600 mb-8">You need to be logged in to view your wishlist.</p>
            <Link href="/login">
              <Button className="bg-primary-600 hover:bg-primary-700">
                Login to Continue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Heart className="h-8 w-8 text-primary-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                  <p className="text-gray-600">{wishlist.length} items</p>
                </div>
              </div>
              {wishlist.length > 0 && (
                <Button onClick={moveAllToCart} className="bg-primary-600 hover:bg-primary-700">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Move All to Bag
                </Button>
              )}
            </div>
          </div>

          {/* Wishlist Items */}
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((product) => {
                const discount = product.originalPrice 
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0;

                return (
                  <div key={product._id} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
                    <div className="relative">
                      <img
                        src={product.images[0] || '/images/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                          {discount}% OFF
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromWishlist(product._id)}
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="p-4">
                      <Link href={`/product/${product._id}`}>
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-primary-600 cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                      
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          <div className="flex text-yellow-400">
                            {'★'.repeat(Math.floor(product.rating))}
                            {'☆'.repeat(5 - Math.floor(product.rating))}
                          </div>
                          <span className="ml-1 text-sm text-gray-600">({product.rating})</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                          )}
                        </div>
                        
                        <Button 
                          size="sm" 
                          onClick={() => addToCart(product)}
                          className="bg-primary-600 hover:bg-primary-700"
                        >
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          Add to Bag
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8">Save your favorite items here for later.</p>
              <Link href="/">
                <Button className="bg-primary-600 hover:bg-primary-700">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}