
"use client";

import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

interface AppContextType {
  cartItems: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isItemInWishlist: (productId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const { toast } = useToast();

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => [...prevItems, product]);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const addToWishlist = (product: Product) => {
    setWishlistItems((prevItems) => {
      if (prevItems.find((item) => item.id === product.id)) {
        return prevItems;
      }
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
      return [...prevItems, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prevItems) => {
      const productToRemove = prevItems.find(p => p.id === productId);
      if (productToRemove) {
        toast({
            title: "Removed from Wishlist",
            description: `${productToRemove.name} has been removed from your wishlist.`,
            variant: "destructive",
        });
      }
      return prevItems.filter((item) => item.id !== productId)
    });
  };

  const isItemInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const contextValue = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isItemInWishlist,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [cartItems, wishlistItems]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
