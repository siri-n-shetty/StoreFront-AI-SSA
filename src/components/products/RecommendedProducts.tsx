
"use client";

import type { Product } from "@/lib/types";
import { ProductCarousel } from "./ProductCarousel";

interface RecommendedProductsProps {
    products: Product[];
}

export function RecommendedProducts({ products }: RecommendedProductsProps) {
    if (products.length > 0) {
        return <ProductCarousel products={products} />;
    }
    return <p className="text-center text-muted-foreground">Could not load recommendations.</p>;
}
