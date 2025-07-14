
'use server';

import type { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function addProduct(newProductData: Omit<Product, 'id' | 'rating' | 'reviews'>) {
  try {
    const productsCollectionRef = collection(db, "products");
    
    const docRef = await addDoc(productsCollectionRef, {
      ...newProductData,
      rating: 0,
      reviews: 0,
      createdAt: serverTimestamp(),
    });
    
    // Revalidate paths to show the new product
    revalidatePath('/');
    revalidatePath('/products');

    return { success: true, product: { id: docRef.id, ...newProductData, rating: 0, reviews: 0 } };
  } catch (error) {
    console.error("Error adding product:", error);
    return { success: false, message: "Failed to add product." };
  }
}
