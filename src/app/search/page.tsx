import { ProductGrid } from "@/components/products/ProductGrid";
import { products } from "@/lib/data";
import type { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function getAllProducts(): Promise<Product[]> {
  // Start with local products and add IDs if they don't have them
  const localProductsWithIds = products.map((product, index) => ({
    ...product,
    id: product.id || `product-${index + 1}`
  }));

  if (!db) {
    console.log("Firebase not configured, using local data only");
    return localProductsWithIds;
  }

  try {
    // Try to get all products from Firestore
    const productsCollection = collection(db, "products");
    const snapshot = await getDocs(productsCollection);
    
    if (!snapshot.empty) {
      const firestoreProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      
      // Combine and deduplicate products (prefer local data over Firestore for consistency)
      const allProducts = [...localProductsWithIds];
      
      // Add Firestore products that aren't already in local data
      firestoreProducts.forEach(firestoreProduct => {
        const existsInLocal = localProductsWithIds.some(lp => 
          lp.name === firestoreProduct.name && lp.category === firestoreProduct.category
        );
        if (!existsInLocal) {
          allProducts.push(firestoreProduct);
        }
      });
      
      return allProducts;
    }
    
    // Fallback to local data if Firestore is empty
    console.log("No products found in Firestore, using local data");
    return localProductsWithIds;
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    // Fallback to local data on error
    return localProductsWithIds;
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams.q || "";
  
  const allProducts = await getAllProducts();
  
  const filteredProducts: Product[] = searchQuery
    ? allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-12">
      {searchQuery ? (
        <>
          <h1 className="text-3xl font-bold font-headline mb-2">
            Search results for &quot;{searchQuery}&quot;
          </h1>
          <p className="text-muted-foreground mb-8">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
          </p>
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No products found matching your search.</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold font-headline mb-2">Search for Products</h1>
          <p className="text-muted-foreground">
            Use the search bar in the header to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}
