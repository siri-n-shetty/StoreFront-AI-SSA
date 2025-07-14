'use server';

/**
 * @fileOverview An AI agent for generating a virtual try-on image.
 *
 * - virtualTryOn - A function that generates an image of a person wearing a product.
 * - VirtualTryOnInput - The input type for the virtualTryOn function.
 * - VirtualTryOnOutput - The return type for the virtualTryOn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {products} from '@/lib/data';
import type {Product} from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const VirtualTryOnInputSchema = z.object({
  personImage: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  productId: z
    .string()
    .describe(
      "The ID of the product (apparel item) the person wants to try on"
    ),
});
export type VirtualTryOnInput = z.infer<typeof VirtualTryOnInputSchema>;

const VirtualTryOnOutputSchema = z.object({
  generatedImage: z
    .string()
    .describe(
      "The generated try-on image as a data URI."
    ),
  product: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    description: z.string(),
    category: z.string(),
    image: z.string(),
  }).describe("Details of the product being tried on"),
});
export type VirtualTryOnOutput = z.infer<typeof VirtualTryOnOutputSchema>;

export async function virtualTryOn(input: VirtualTryOnInput): Promise<VirtualTryOnOutput> {
  return virtualTryOnFlow(input);
}

// Helper function to get all apparel products available for virtual try-on
export async function getTryOnAvailableProducts(): Promise<Product[]> {
  // Start with local products and add IDs if they don't have them
  const localProductsWithIds = products.map((product, index) => ({
    ...product,
    id: product.id || `product-${index + 1}`
  }));

  // Filter local products for try-on availability
  const localTryOnProducts = localProductsWithIds.filter(product => 
    product.category === 'apparel' && product.isTryOnAvailable
  );

  try {
    // Also get apparel products from Firestore that are available for try-on
    const productsRef = collection(db, "products");
    const q = query(
      productsRef, 
      where("category", "==", "apparel"), 
      where("isTryOnAvailable", "==", true)
    );
    const querySnapshot = await getDocs(q);
    
    const allTryOnProducts = [...localTryOnProducts];
    
    if (!querySnapshot.empty) {
      const firestoreTryOnProducts = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Product));
      
      // Add Firestore products that aren't already in local data
      firestoreTryOnProducts.forEach(firestoreProduct => {
        const existsInLocal = localTryOnProducts.some(lp => 
          lp.name === firestoreProduct.name && lp.category === firestoreProduct.category
        );
        if (!existsInLocal) {
          allTryOnProducts.push(firestoreProduct);
        }
      });
      
      console.log(`Try-on has access to ${allTryOnProducts.length} products (${localTryOnProducts.length} from local data, ${allTryOnProducts.length - localTryOnProducts.length} additional from Firestore)`);
    } else {
      console.log("No try-on products found in Firestore, using local data only");
    }
    
    return allTryOnProducts;
  } catch (error) {
    console.error("Error fetching try-on products from Firestore, using local data only:", error);
    return localTryOnProducts;
  }
}

const virtualTryOnFlow = ai.defineFlow(
  {
    name: 'virtualTryOnFlow',
    inputSchema: VirtualTryOnInputSchema,
    outputSchema: VirtualTryOnOutputSchema,
  },
  async (input) => {
    // Add IDs to products if they don't have them (for local data compatibility)
    const productsWithIds = products.map((product, index) => ({
      ...product,
      id: product.id || `product-${index + 1}`
    }));

    // First try to find the product in local data
    let product = productsWithIds.find(p => p.id === input.productId);
    
    // If not found locally, try to fetch from Firestore
    if (!product) {
      try {
        console.log(`Product ${input.productId} not found locally, trying Firestore...`);
        const productDoc = await getDoc(doc(db, "products", input.productId));
        if (productDoc.exists()) {
          product = { id: productDoc.id, ...productDoc.data() } as Product;
          console.log(`Product ${input.productId} found in Firestore:`, product.name);
        } else {
          console.log(`Product ${input.productId} not found in Firestore either`);
        }
      } catch (error) {
        console.error("Error fetching product from Firestore:", error);
      }
    } else {
      console.log(`Product ${input.productId} found locally:`, product.name);
    }
    
    if (!product) {
      throw new Error(`Product with ID ${input.productId} not found`);
    }

    // Check if the product is available for try-on
    if (!product.isTryOnAvailable) {
      throw new Error(`Virtual try-on is not available for product: ${product.name}`);
    }

    // Check if the product is apparel category
    if (product.category !== 'apparel') {
      throw new Error(`Virtual try-on is only available for apparel items. This product is in category: ${product.category}`);
    }

    console.log(`Attempting to generate virtual try-on for ${product.name} with image: ${product.image}`);

    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
          {media: {url: input.personImage}},
          {media: {url: product.image}},
          {text: `Generate a realistic image of the person in the first image wearing the ${product.name} from the second image. The clothing item should fit naturally on the person while maintaining the original design, color, and style of the ${product.name}. Keep the person's pose, facial features, and background exactly the same. Only replace or add the clothing item - do not modify anything else about the person or scene. Make sure the clothing looks realistic and properly fitted.`},
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!media) {
        throw new Error('Virtual try-on image generation failed - no media returned.');
      }

      return {
        generatedImage: media.url,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          category: product.category,
          image: product.image,
        }
      };
    } catch (error) {
      console.error(`Error generating virtual try-on image for ${product.name}:`, error);
      
      // If there's an error with the product image URL, try a text-only approach
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('HTTP error downloading media')) {
        console.log(`Product image URL inaccessible, trying text-only description approach...`);
        
        try {
          const { media: fallbackMedia } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: [
              {media: {url: input.personImage}},
              {text: `Generate a realistic image of the person in the image wearing a ${product.name}. Based on the product description: "${product.description}". The clothing item should fit naturally on the person while maintaining their original pose, facial features, and background. Only add or replace the clothing item - do not modify anything else about the person or scene. Make sure the clothing looks realistic and properly fitted. Use the product features to guide the appearance: ${product.features?.join(', ') || 'standard clothing features'}.`},
            ],
            config: {
              responseModalities: ['TEXT', 'IMAGE'],
            },
          });

          if (!fallbackMedia) {
            throw new Error('Fallback virtual try-on generation also failed.');
          }

          return {
            generatedImage: fallbackMedia.url,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              description: product.description,
              category: product.category,
              image: product.image,
            }
          };
        } catch (fallbackError) {
          console.error(`Fallback approach also failed:`, fallbackError);
          throw new Error(`Unable to generate virtual try-on for ${product.name}. The product image may be temporarily unavailable. Please try with a different product or try again later.`);
        }
      }
      
      // For other errors, re-throw with more context
      throw new Error(`Virtual try-on generation failed for ${product.name}: ${errorMessage}`);
    }
  }
);
