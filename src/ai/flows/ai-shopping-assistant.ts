// This file is machine-generated - edit with caution!
'use server';
/**
 * @fileOverview A shopping assistant AI agent.
 *
 * - askQuestion - A function that handles the shopping assistant process.
 * - AskQuestionInput - The input type for the askQuestion function.
 * - AskQuestionOutput - The return type for the askQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {products} from '@/lib/data';
import type {Product} from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from "firebase/firestore";

const AskQuestionInputSchema = z.object({
  question: z.string().describe('The question the user is asking the shopping assistant.'),
});
export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;

const AskQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question.'),
  recommendedProducts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    description: z.string(),
    category: z.string(),
    image: z.string(),
    rating: z.number(),
    features: z.array(z.string())
  })).optional().describe('Recommended products based on the user\'s question.'),
});
export type AskQuestionOutput = z.infer<typeof AskQuestionOutputSchema>;

export async function askQuestion(input: AskQuestionInput): Promise<AskQuestionOutput> {
  return askQuestionFlow(input);
}

// Helper function to get all products from both local data and Firestore
async function getAllProducts(): Promise<Product[]> {
  // Start with local products and add IDs if they don't have them
  const localProductsWithIds = products.map((product, index) => ({
    ...product,
    id: product.id || `product-${index + 1}`
  }));

  try {
    // Try to get products from Firestore
    const productsRef = collection(db, "products");
    const querySnapshot = await getDocs(productsRef);
    
    if (!querySnapshot.empty) {
      // Get all products from Firestore
      const firestoreProducts = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Product));
      
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
      
      console.log(`AI Assistant has access to ${allProducts.length} products (${localProductsWithIds.length} from local data, ${allProducts.length - localProductsWithIds.length} additional from Firestore)`);
      return allProducts;
    } else {
      console.log("No products found in Firestore, using local data only");
      return localProductsWithIds;
    }
  } catch (error) {
    console.error("Error fetching products from Firestore, using local data only:", error);
    return localProductsWithIds;
  }
}

const prompt = ai.definePrompt({
  name: 'askQuestionPrompt',
  input: {
    schema: z.object({
      question: z.string(),
      products: z.string()
    })
  },
  output: {schema: AskQuestionOutputSchema},
  prompt: `You are a helpful shopping assistant for a Walmart-like e-commerce platform. Your goal is to help users find products that match their needs and provide relevant recommendations.

Available products database: {{products}}

User question: {{question}}

Instructions:
1. Analyze the user's question to understand what they're looking for
2. Provide a helpful answer addressing their question
3. IMPORTANT: If the question relates to shopping, finding products, or mentions any product categories, you MUST recommend relevant products from the available database
4. Search through the products for items that match the user's needs based on:
   - Category (apparel, electronics, beauty, home goods, etc.)
   - Price range (if mentioned) - STRICTLY filter by price constraints
   - Features or specifications
   - Description keywords
5. Always include 2-5 relevant product recommendations when the question is shopping-related
6. Focus on products with good ratings (4.0+) when possible
7. Include the full product details: id, name, price, description, category, image, rating, and features
8. PRICE FILTERING: When users specify price ranges like "above $50", "under $100", "between $20-$80", filter products accordingly

Example shopping-related questions that should get product recommendations:
- "I need a hoodie" → recommend hoodies from apparel category
- "hoodies above $50" → recommend ONLY hoodies with price > $50
- "What's a good phone under $500?" → recommend electronics with price < $500
- "I'm looking for comfortable shoes" → recommend footwear from apparel
- "Show me some winter clothing" → recommend seasonal apparel
- "I need something for my kitchen" → recommend home goods/kitchen items

CRITICAL: When price constraints are mentioned, you MUST filter products to match those constraints exactly.

Respond with both a helpful answer AND product recommendations for any shopping-related query.`,
});

const askQuestionFlow = ai.defineFlow(
  {
    name: 'askQuestionFlow',
    inputSchema: AskQuestionInputSchema,
    outputSchema: AskQuestionOutputSchema,
  },
  async (input: AskQuestionInput) => {
    // Get all products from both local data and Firestore
    const allProducts = await getAllProducts();

    // Retry logic for handling API overload
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`AI Assistant attempt ${attempt}/${maxRetries} for question: "${input.question}"`);
        
        const {output} = await prompt({
          question: input.question,
          products: JSON.stringify(allProducts)
        });
        
        console.log(`AI Assistant successfully responded on attempt ${attempt}`);
        return output!;
      } catch (error) {
        lastError = error;
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
          console.log(`AI Assistant attempt ${attempt} failed - service overloaded. ${attempt < maxRetries ? 'Retrying...' : 'Max retries reached.'}`);
          
          if (attempt < maxRetries) {
            // Wait with exponential backoff before retrying
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        } else {
          console.error(`AI Assistant attempt ${attempt} failed with non-recoverable error:`, error);
          break; // Don't retry for non-overload errors
        }
      }
    }

    // If all retries failed, provide a fallback response
    console.error('AI Assistant failed after all retries, providing fallback response');
    return {
      answer: "I'm sorry, but I'm currently experiencing high traffic and unable to process your request. Please try asking your question again in a few moments. In the meantime, you can browse our products directly on the products page.",
      recommendedProducts: []
    };
  }
);
