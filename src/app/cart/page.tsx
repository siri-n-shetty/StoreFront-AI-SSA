
"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { Trash2, X, Bot, Loader2, CheckCircle } from "lucide-react";
import { getSmartCartSuggestions } from "@/app/actions";
import { useState, useEffect } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/products/ProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cartItems, removeFromCart, checkout } = useAppContext();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsCheckingOut(true);
    
    // Sample shipping address - in a real app, you'd collect this from the user
    const sampleShippingAddress = {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
      country: "USA"
    };

    try {
      await checkout(user.id, sampleShippingAddress);
      setShowOrderConfirmation(true);
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCloseConfirmation = () => {
    setShowOrderConfirmation(false);
    // Redirect to orders page to see the new order
    router.push('/orders');
  };

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    // In a real app, this would come from user data
    const purchaseHistory = ["Classic Crewneck T-Shirt"]; 
    const browsingHistory = ["Slim-Fit Chino Pants", "Noise-Cancelling Headphones"];
    
    const result = await getSmartCartSuggestions(purchaseHistory, browsingHistory);
    setSuggestions(result);
    setIsLoading(false);
  };

  if (loading || !user) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold font-headline mb-8">Your Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-lg text-muted-foreground">Your cart is empty.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                    data-ai-hint="cart item"
                  />
                  <div className="flex-grow">
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <p className="font-semibold">${item.price.toFixed(2)}</p>
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="sticky top-24 p-6 bg-secondary/60 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <Button size="lg" className="w-full mt-6" onClick={handleCheckout} disabled={isCheckingOut}>
                {isCheckingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-24">
        <div className="text-center">
           <h2 className="text-2xl font-bold font-headline mb-2 flex items-center justify-center gap-2">
             <Bot /> Smart Cart Suggestions
           </h2>
           <p className="text-muted-foreground mb-6">Let our AI find items you might like.</p>
           <Button onClick={handleGetSuggestions} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Get AI Suggestions
          </Button>
        </div>
         {suggestions.length > 0 && (
          <div className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {suggestions.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Confirmation Dialog */}
      <Dialog open={showOrderConfirmation} onOpenChange={setShowOrderConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Order Placed Successfully!
            </DialogTitle>
            <DialogDescription className="text-center mt-2">
              Thank you for your purchase! Your order has been confirmed and will be processed shortly.
              You can view your order details in your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button onClick={handleCloseConfirmation} className="w-full">
              View My Orders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
