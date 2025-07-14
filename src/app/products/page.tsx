import { ProductGrid } from "@/components/products/ProductGrid";
import type { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ProductFilters } from "@/components/products/ProductFilters";
import { products as localProducts } from "@/lib/data";

async function getProducts(category?: string): Promise<Product[]> {
  try {
    // Get products from local data first (primary source)
    let allProducts = [...localProducts];

    // Get products from Firestore as fallback/supplement only if db is available
    if (db) {
      try {
        const productsCollection = collection(db, "products");
        const q =
          category && category !== "All"
            ? query(productsCollection, where("category", "==", category))
            : query(productsCollection);

        const snapshot = await getDocs(q);
        const firestoreProducts = snapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Product));

        // Combine and deduplicate (local data takes priority)
        const productMap = new Map();
        
        // Add local products first (they have priority)
        allProducts.forEach(product => {
          productMap.set(product.name, product);
        });
        
        // Add Firestore products only if they don't exist in local data
        firestoreProducts.forEach(product => {
          if (!productMap.has(product.name)) {
            productMap.set(product.name, product);
          }
        });

        allProducts = Array.from(productMap.values());
      } catch (firestoreError) {
        console.warn("Firestore unavailable, using local data only:", firestoreError);
      }
    } else {
      console.log("Firebase not configured, using local data only");
    }

    // Apply category filter if specified
    if (category && category !== "All") {
      allProducts = allProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    return allProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    // Return local products as fallback
    let fallbackProducts = [...localProducts];
    
    if (category && category !== "All") {
      fallbackProducts = fallbackProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    return fallbackProducts;
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { category } = resolvedSearchParams;
  const filteredProducts = await getProducts(category);
  
  // Format the title properly
  const formatCategoryTitle = (cat?: string) => {
    if (!cat || cat === "All") return "All Products";
    
    // Convert category key to display name
    const categoryMap: { [key: string]: string } = {
      "apparel": "Apparel",
      "electronics": "Electronics", 
      "home-goods": "Home Goods",
      "beauty": "Beauty",
      "shoes": "Shoes"
    };
    
    return categoryMap[cat] || cat;
  };
  
  const title = formatCategoryTitle(category);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <ProductFilters />
          </div>
        </aside>
        <main className="lg:col-span-3">
          <h1 className="text-3xl font-bold font-headline mb-8">{title}</h1>
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <p className="text-lg text-muted-foreground">
                No products found in this category.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
