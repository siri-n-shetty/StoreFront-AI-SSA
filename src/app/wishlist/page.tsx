
"use client";

import { useAppContext } from "@/contexts/AppContext";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WishlistPage() {
  const { wishlistItems } = useAppContext();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold font-headline mb-8 flex items-center gap-3">
        <Heart className="h-8 w-8 text-red-500" />
        Your Wishlist
      </h1>
      {wishlistItems.length === 0 ? (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-lg text-muted-foreground">Your wishlist is empty.</p>
          <p className="text-sm text-muted-foreground mt-2">Browse products and click the heart icon to save them for later.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Discover Products</Link>
          </Button>
        </div>
      ) : (
        <ProductGrid products={wishlistItems} />
      )}
    </div>
  );
}
