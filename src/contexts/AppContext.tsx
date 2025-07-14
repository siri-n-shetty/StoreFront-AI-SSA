
"use client";

import type { Product, Order, OrderItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

interface AppContextType {
  cartItems: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (userId: string) => void;
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isItemInWishlist: (productId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      // Check if product already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      if (existingItemIndex !== -1) {
        // Product already in cart, just show toast
        toast({
          title: "Already in Cart",
          description: `${product.name} is already in your cart.`,
        });
        return prevItems;
      }
      // Add new product to cart
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
      return [...prevItems, product];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const addOrder = (userId: string) => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    // Create order items from cart
    const orderItems: OrderItem[] = cartItems.map((product, index) => ({
      id: `${product.id}-${Date.now()}-${index}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity: 1, // For now, we'll assume quantity is 1
      total: product.price,
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);

    // Create order object
    const order: Order = {
      id: `order-${Date.now()}`,
      userId,
      items: orderItems,
      totalAmount,
      status: 'pending',
      orderDate: new Date().toISOString(),
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      shippingAddress: {
        street: "123 Main St",
        city: "Sample City",
        state: "CA",
        zipCode: "12345",
        country: "USA"
      },
    };

    // Add to orders
    setOrders((prevOrders) => [order, ...prevOrders]);

    // Clear cart
    clearCart();

    toast({
      title: "Order placed successfully!",
      description: `Your order of $${totalAmount.toFixed(2)} has been placed.`,
    });
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
    clearCart,
    orders,
    addOrder,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isItemInWishlist,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [cartItems, wishlistItems, orders]);

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
