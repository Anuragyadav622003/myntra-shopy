'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface CartItem {
  product: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { product: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType {
  cart: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string, size?: string, color?: string) => boolean;
  getItemQuantity: (productId: string, size?: string, color?: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to calculate cart totals
const calculateTotals = (items: CartItem[]): CartState => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { items, total, itemCount };
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => 
          item.product === action.payload.product && 
          item.size === action.payload.size && 
          item.color === action.payload.color
      );

      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, action.payload];
      }

      return calculateTotals(newItems);
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => 
        item.product !== action.payload
      );
      return calculateTotals(newItems);
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.product === action.payload.product
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0); // Remove items with 0 quantity

      return calculateTotals(newItems);
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 };

    case 'LOAD_CART':
      return calculateTotals(action.payload);

    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('myntra-cart');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: items });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Clear corrupted cart data
        localStorage.removeItem('myntra-cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('myntra-cart', JSON.stringify(cart.items));
  }, [cart.items]);

  // Add item to cart
  const addItem = (item: CartItem) => {
    if (item.quantity <= 0) {
      console.error('Cannot add item with quantity <= 0');
      return;
    }
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  // Remove item from cart
  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  // Update item quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 0) {
      console.error('Quantity cannot be negative');
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { product: productId, quantity } });
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Check if product is in cart
  const isInCart = (productId: string, size?: string, color?: string): boolean => {
    return cart.items.some(item => 
      item.product === productId && 
      (!size || item.size === size) && 
      (!color || item.color === color)
    );
  };

  // Get quantity of specific product in cart
  const getItemQuantity = (productId: string, size?: string, color?: string): number => {
    const item = cart.items.find(item => 
      item.product === productId && 
      (!size || item.size === size) && 
      (!color || item.color === color)
    );
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};