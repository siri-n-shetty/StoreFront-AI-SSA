
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Image as ImageIcon, Upload, Sparkles, Loader2, Shirt, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import Image from 'next/image';
import { generateVirtualTryOnImage } from '../actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getTryOnAvailableProducts } from '@/ai/flows/virtual-try-on';

export default function VirtualTryOnPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedProduct, setGeneratedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(true);
  
  const personFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchApparel = async () => {
      try {
        // First try to get products from Firestore
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("category", "==", "apparel"), where("isTryOnAvailable", "==", true), limit(20));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // Fallback to local data if Firestore is empty
          console.log("No products found in Firestore, using local data");
          const localProducts = await getTryOnAvailableProducts();
          setProducts(localProducts);
        } else {
          const apparelProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setProducts(apparelProducts);
        }
      } catch (error) {
        console.error("Error fetching apparel from Firestore, falling back to local data:", error);
        // Fallback to local data if there's an error
        const localProducts = await getTryOnAvailableProducts();
        setProducts(localProducts);
        
        if (localProducts.length === 0) {
          toast({
            title: "Error",
            description: "Could not fetch products for try-on.",
            variant: "destructive",
          });
        }
      } finally {
        setIsFetchingProducts(false);
      }
    };
    fetchApparel();
  }, [toast]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setImage: (dataUrl: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateClick = async () => {
    if (!personImage || !selectedProduct?.id) {
      toast({
        title: "Missing Requirements",
        description: "Please upload an image of a person and select a product.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setGeneratedImage(null);
    
    try {
      const result = await generateVirtualTryOnImage({
        personImage,
        productId: selectedProduct.id,
      });
      
      if (result.success && result.image) {
        setGeneratedImage(result.image);
        setGeneratedProduct(selectedProduct);
        toast({
          title: "Success!",
          description: `Virtual try-on generated for ${selectedProduct.name}!`,
        });
      } else {
        toast({
          title: "Generation Failed",
          description: result.message || "Failed to generate virtual try-on image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Try-on generation error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Virtual Try-On</h1>
        <p className="text-lg text-muted-foreground mt-2">Upload your photo and see how our products look on you!</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Step 1: Select Product */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shirt className="h-6 w-6" /> Step 1: Select a Product</CardTitle>
            <CardDescription>Choose an item you'd like to try on.</CardDescription>
          </CardHeader>
          <CardContent>
            {isFetchingProducts ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : products.length > 0 ? (
               <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {products.map(product => (
                  <button 
                    key={product.id} 
                    onClick={() => setSelectedProduct(product)} 
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all text-left hover:shadow-md ${
                      selectedProduct?.id === product.id 
                        ? 'border-primary ring-2 ring-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                     <Image 
                       src={product.image} 
                       alt={product.name} 
                       width={60} 
                       height={60} 
                       className="object-cover w-15 h-15 rounded-md flex-shrink-0" 
                       data-ai-hint="product image"
                     />
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium truncate">{product.name}</p>
                       <p className="text-xs text-muted-foreground">${product.price}</p>
                       <div className="flex items-center gap-1 mt-1">
                         <span className="text-xs text-yellow-600">★</span>
                         <span className="text-xs text-muted-foreground">{product.rating}</span>
                       </div>
                     </div>
                  </button>
                ))}
               </div>
            ) : (
                <p className="text-sm text-center text-muted-foreground py-8">No try-on enabled products found.</p>
            )}
            
            {selectedProduct && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">Selected Product:</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedProduct.name}</p>
                    <p className="text-xs font-medium">${selectedProduct.price}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedProduct(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Step 2: Upload Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImageIcon className="h-6 w-6" /> Step 2: Upload Your Photo</CardTitle>
             <CardDescription>Upload a clear, front-facing photo.</CardDescription>
          </CardHeader>
          <CardContent>
              <div 
                onClick={() => personFileInputRef.current?.click()}
                className="w-full aspect-square bg-secondary rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer border-2 border-dashed hover:border-primary transition-colors"
              >
                  {personImage ? (
                    <>
                      <Image src={personImage} alt="Person to try on" layout="fill" objectFit="cover" />
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8" onClick={(e) => { e.stopPropagation(); setPersonImage(null); if(personFileInputRef.current) personFileInputRef.current.value = ""; }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Upload className="mx-auto h-12 w-12" />
                      <p>Click to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={personFileInputRef}
                    onChange={(e) => handleFileChange(e, setPersonImage)}
                    className="hidden"
                    accept="image/png, image/jpeg"
                  />
              </div>
          </CardContent>
        </Card>

        {/* Step 3: Generate */}
        <div className="space-y-4">
            <Button size="lg" className="w-full" onClick={handleGenerateClick} disabled={isLoading || !personImage || !selectedProduct}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              {isLoading ? 'Generating...' : 'Generate Try-On'}
            </Button>
            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" />Result</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="w-full aspect-square bg-secondary rounded-lg flex items-center justify-center relative overflow-hidden">
                        {isLoading ? (
                            <div className="text-center text-muted-foreground">
                                <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                                <p className="mt-2 text-sm">Our AI is working its magic...</p>
                            </div>
                        ) : generatedImage ? (
                            <>
                              <Image src={generatedImage} alt="Generated try-on" layout="fill" objectFit="cover" />
                              {generatedProduct && (
                                <div className="absolute bottom-2 left-2 right-2 bg-black/80 text-white p-2 rounded text-xs">
                                  <p className="font-medium">{generatedProduct.name}</p>
                                  <p>${generatedProduct.price}</p>
                                </div>
                              )}
                            </>
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                <p>Your generated image will appear here.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
      <Alert variant="default" className="mt-12 max-w-4xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Experimental Feature</AlertTitle>
          <AlertDescription>
            Virtual Try-On is powered by generative AI and uses our product catalog. Results may vary and might not always be perfect. For best results, use a clear, well-lit, front-facing photo. Only apparel items with try-on enabled are available for virtual try-on.
          </AlertDescription>
      </Alert>
    </div>
  );
}
