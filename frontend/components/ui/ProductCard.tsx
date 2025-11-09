'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
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
  discount?: number;
  sizes?: Array<{ size: string; stock: number }>;
  colors?: Array<{ name: string; code: string }>;
  category: string | { _id: string; name: string };
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  isInWishlist?: boolean;
  onWishlistToggle?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode, 
  isInWishlist = false,
  onWishlistToggle 
}) => {
  const { addItem, isInCart, getItemQuantity } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || 'Default');
  const [showSizeColorSelector, setShowSizeColorSelector] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isProductInCart = isInCart(product._id, selectedSize, selectedColor);
  const cartQuantity = getItemQuantity(product._id, selectedSize, selectedColor);

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to manage wishlist');
      router.push('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      await axios.post(`${BaseUrl}/api/users/wishlist/${product._id}`);
      
      if (onWishlistToggle) {
        onWishlistToggle(product._id);
      }
      
      toast.success(
        isInWishlist 
          ? 'Removed from wishlist' 
          : 'Added to wishlist'
      );
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    if (product.sizes && product.sizes.length > 1) {
      setShowSizeColorSelector(true);
      return;
    }

    addToCart();
  };

  const addToCart = () => {
    addItem({
      product: product._id,
      name: product.name,
      image: product.images[0] || '/images/placeholder.jpg',
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity: 1
    });
    toast.success('Added to cart!');
    setShowSizeColorSelector(false);
  };

  const handleQuickAdd = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }
    addToCart();
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Product Image */}
          <div className="shrink-0">
            <Link href={`/product/${product._id}`}>
              <img
                src={product.images[0] || '/images/placeholder.jpg'}
                alt={product.name}
                className="w-full md:w-48 h-48 md:h-48 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
              />
            </Link>
          </div>
          
          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2 gap-2">
              <Link href={`/product/${product._id}`} className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 hover:text-pink-600 cursor-pointer line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`shrink-0 ${
                  isInWishlist 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                {isInWishlist ? (
                  <Heart className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                ) : (
                  <Heart className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </Button>
            </div>
            
            <p className="text-gray-600 mb-3 md:mb-4 line-clamp-2 text-sm md:text-base">{product.description}</p>
            
            <div className="flex items-center mb-3 md:mb-4 flex-wrap gap-1 md:gap-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
              </div>
              <span className="text-gray-300 mx-1 md:mx-2">•</span>
              <span className="text-sm text-gray-600">{product.brand}</span>
            </div>
            
            {/* Size and Color Selection for List View */}
            {(product.sizes && product.sizes.length > 0) && (
              <div className="flex items-center gap-2 mb-3 md:mb-4 flex-wrap">
                {product.sizes.slice(0, 4).map((sizeObj) => (
                  <button
                    key={sizeObj.size}
                    onClick={() => setSelectedSize(sizeObj.size)}
                    className={`px-2 py-1 md:px-3 md:py-1 border rounded text-xs md:text-sm transition-colors ${
                      selectedSize === sizeObj.size
                        ? 'border-pink-600 bg-pink-50 text-pink-600'
                        : 'border-gray-300 hover:border-pink-600'
                    }`}
                  >
                    {sizeObj.size}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-bold text-gray-900">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm md:text-base text-gray-500 line-through">₹{product.originalPrice}</span>
                )}
                {discount > 0 && (
                  <span className="text-xs md:text-sm font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                    {discount}% OFF
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isProductInCart && (
                  <div className="flex items-center text-green-600 text-xs md:text-sm">
                    <Check className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    In Cart ({cartQuantity})
                  </div>
                )}
                <Button 
                  onClick={handleAddToCart}
                  className="bg-pink-600 hover:bg-pink-700 text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2"
                >
                  <ShoppingBag className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  {isProductInCart ? 'Add More' : 'Add to Bag'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View - Optimized for different screen sizes
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow group h-full flex flex-col">
      {/* <Link href={`/product/${product._id}`}> */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={product.images[0] || '/images/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-fit group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              {discount}% OFF
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`absolute top-2 right-2 bg-white/80 hover:bg-white ${
              isInWishlist 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-600 hover:text-red-500'
            }`}
          >
            {isInWishlist ? (
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
            ) : (
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>
      {/* </Link> */}
      
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <Link href={`/product/${product._id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 hover:text-pink-600 line-clamp-2 cursor-pointer text-sm sm:text-base leading-tight">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <p className="text-gray-600 mb-2 text-xs sm:text-sm line-clamp-1">{product.brand}</p>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-xs sm:text-sm text-gray-600">{product.rating}</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg font-bold text-gray-900">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-xs sm:text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {isProductInCart && (
                <div className="text-green-600 text-xs">
                  ✓ {cartQuantity}
                </div>
              )}
              <Button 
                size="sm" 
                onClick={handleQuickAdd}
                className="bg-pink-600 hover:bg-pink-700 h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          {/* Size Quick Select */}
          {(product.sizes && product.sizes.length > 0) && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {product.sizes.slice(0, 2).map((sizeObj) => (
                <button
                  key={sizeObj.size}
                  onClick={() => {
                    setSelectedSize(sizeObj.size);
                    handleQuickAdd();
                  }}
                  className={`px-1.5 py-0.5 border rounded text-xs transition-colors ${
                    selectedSize === sizeObj.size
                      ? 'border-pink-600 bg-pink-50 text-pink-600'
                      : 'border-gray-300 hover:border-pink-600'
                  }`}
                >
                  {sizeObj.size}
                </button>
              ))}
              {product.sizes.length > 2 && (
                <span className="text-xs text-gray-500">+{product.sizes.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Size & Color Selection Modal */}
      {showSizeColorSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full mx-auto">
            <h3 className="text-lg font-semibold mb-4">Select Options</h3>
            
            {/* Size Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((sizeObj) => (
                  <button
                    key={sizeObj.size}
                    onClick={() => setSelectedSize(sizeObj.size)}
                    className={`px-3 py-2 border rounded-md text-sm transition-colors ${
                      selectedSize === sizeObj.size
                        ? 'border-pink-600 bg-pink-50 text-pink-600'
                        : 'border-gray-300 hover:border-pink-600'
                    } ${sizeObj.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={sizeObj.stock === 0}
                  >
                    {sizeObj.size}
                    {sizeObj.stock === 0 && ' (Out)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`px-3 py-2 border rounded-md flex items-center space-x-2 text-sm transition-colors ${
                        selectedColor === color.name
                          ? 'border-pink-600 bg-pink-50'
                          : 'border-gray-300 hover:border-pink-600'
                      }`}
                    >
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.code }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={addToCart}
                className="flex-1 bg-pink-600 hover:bg-pink-700"
                disabled={!selectedSize}
              >
                Add to Bag
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSizeColorSelector(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;