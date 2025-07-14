"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Camera, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { useAppContext } from "@/contexts/AppContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState, use } from "react";
import type { Product } from "@/lib/types";


export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { addToCart, addToWishlist, removeFromWishlist, isItemInWishlist } = useAppContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", resolvedParams.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [resolvedParams.id]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12 flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!product) {
    return notFound();
  }

  const inWishlist = isItemInWishlist(product.id);

  const handleWishlistClick = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="relative">
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            className="w-full rounded-lg shadow-lg object-cover"
            data-ai-hint={`${product.category.toLowerCase()} product detail`}
          />
        </div>
        <div>
          <Badge variant="secondary" className="mb-2">{product.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
            </div>
            <span className="text-muted-foreground text-sm">{product.rating.toFixed(1)} ({product.reviews} reviews)</span>
          </div>
          <p className="text-3xl font-bold mb-6">${product.price.toFixed(2)}</p>
          <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="flex-1" onClick={() => addToCart(product)}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                </Button>
                <Button size="lg" variant="outline" className="flex-1" onClick={handleWishlistClick}>
                    <Heart className={`mr-2 h-5 w-5 ${inWishlist ? 'text-red-500 fill-current' : ''}`} />
                    {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
            </div>
             {product.isTryOnAvailable && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="lg" variant="outline" className="w-full">
                            <Camera className="mr-2 h-5 w-5" />
                            Virtual Try-On
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Virtual Try-On Is Almost Here!</AlertDialogTitle>
                        <AlertDialogDescription>
                            This feature is currently under development. Soon, you'll be able to use your camera to see how this product looks on you or in your space.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogAction>Got it!</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>

           <div className="mt-8">
                <h3 className="font-semibold text-lg mb-2">Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {product.features.map((feature, index) => <li key={index}>{feature}</li>)}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}
