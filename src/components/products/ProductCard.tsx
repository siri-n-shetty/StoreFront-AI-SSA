"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isItemInWishlist } = useAppContext();
  const inWishlist = isItemInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };
  
  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/products/${product.id}`} className="block">
        <CardContent className="p-0">
          <div className="relative">
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={400}
              className="object-cover w-full h-64 transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={`${product.category.toLowerCase()} product`}
            />
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute top-3 right-3 rounded-full h-9 w-9"
              onClick={handleWishlistClick}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`h-5 w-5 transition-colors ${inWishlist ? 'text-red-500 fill-current' : 'text-foreground'}`} />
            </Button>
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <h3 className="font-semibold text-lg truncate mt-1">{product.name}</h3>
            <div className="flex justify-between items-center mt-4">
              <p className="font-bold text-xl">${product.price.toFixed(2)}</p>
              <Button size="sm" onClick={(e) => { e.preventDefault(); addToCart(product); }}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
