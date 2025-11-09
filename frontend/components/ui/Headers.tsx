'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Search, ShoppingBag, User, Heart, Menu, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Header = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push('/');
  };

  const navigationItems = [
    { name: 'Men', href: '/category/men' },
    { name: 'Women', href: '/category/women' },
    { name: 'Kids', href: '/category/kids' },
    { name: 'Home & Living', href: '/category/home-living' },
    { name: 'Beauty', href: '/category/beauty' },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Top Bar */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-pink-600">
              MYNTRA
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for brands, products and more"
                  className="w-full px-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 border border-gray-200"
                />
                <button type="submit" className="absolute right-3 top-2.5">
                  <Search className="h-5 w-5 text-gray-400 hover:text-pink-600" />
                </button>
              </div>
            </form>

            {/* User Actions */}
            <nav className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <div className="flex items-center space-x-1 group relative">
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">{user.name}</span>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block">
                      <Link href="/profile" className="block px-4 py-2 hover:bg-gray-50">Profile</Link>
                      <Link href="/orders" className="block px-4 py-2 hover:bg-gray-50">Orders</Link>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600">
                        Logout
                      </button>
                    </div>
                  </div>
                  <Link href="/wishlist" className="flex items-center space-x-1 text-sm font-medium hover:text-pink-600">
                    <Heart className="h-5 w-5" />
                    <span>Wishlist</span>
                  </Link>
                  <Link href="/cart" className="flex items-center space-x-1 text-sm font-medium hover:text-pink-600 relative">
                    <ShoppingBag className="h-5 w-5" />
                    <span>Bag</span>
                    {cart.itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.itemCount}
                      </span>
                    )}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="text-sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="text-sm bg-pink-600 hover:bg-pink-700">Sign Up</Button>
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-4">
        <nav className="hidden md:flex items-center justify-center space-x-8 py-3">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button type="submit" className="absolute right-3 top-2">
                  <Search className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile User Actions */}
            <div className="border-t pt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-pink-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-pink-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Wishlist</span>
                  </Link>
                  <Link
                    href="/cart"
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-pink-600 relative"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Bag</span>
                    {cart.itemCount > 0 && (
                      <span className="bg-pink-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {cart.itemCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full text-sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full text-sm bg-pink-600 hover:bg-pink-700">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;