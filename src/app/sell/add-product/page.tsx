
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addProduct } from "@/app/products/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Product } from "@/lib/types";

export default function AddProductPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== UserRole.SELLER) {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    const productData = {
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        features: (formData.get("features") as string).split(',').map(f => f.trim()),
        image: 'https://placehold.co/600x600.png', // Placeholder image
        isTryOnAvailable: formData.get("isTryOnAvailable") === "on",
    };

    const result = await addProduct(productData);

    if (result.success) {
      toast({
        title: "Product Added!",
        description: `"${result.product?.name}" has been successfully added.`,
      });
      router.push(`/products/${result.product?.id}`);
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (loading || !user || user.role !== UserRole.SELLER) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>Add a New Product</CardTitle>
          <CardDescription>Fill out the form below to list a new item in the store.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" placeholder="e.g., Stylish Leather Jacket" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" name="price" type="number" step="0.01" placeholder="e.g., 199.99" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Apparel">Apparel</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Home Goods">Home Goods</SelectItem>
                        <SelectItem value="Beauty">Beauty</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Describe the product..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input id="features" name="features" placeholder="e.g., 100% Genuine Leather, YKK Zippers, Slim Fit" required />
            </div>
             <div className="flex items-center space-x-2">
                <input type="checkbox" id="isTryOnAvailable" name="isTryOnAvailable" className="h-4 w-4" />
                <Label htmlFor="isTryOnAvailable">Virtual Try-On Available?</Label>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Add Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
