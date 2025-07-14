
'use server';

import { askQuestion } from '@/ai/flows/ai-shopping-assistant';
import { smartCartSuggestions } from '@/ai/flows/smart-cart-suggestions';
import { virtualTryOn } from '@/ai/flows/virtual-try-on';
import type { VirtualTryOnInput } from '@/ai/flows/virtual-try-on';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

export async function getAiAssistantResponse(question: string): Promise<string> {
  if (!question) {
    return "Please ask a question.";
  }
  try {
    const response = await askQuestion({ question });
    return response.answer;
  } catch (error) {
    console.error('Error getting AI assistant response:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
      return "I'm currently experiencing high traffic due to popular demand! 🔥 Please try asking your question again in a moment. While you wait, feel free to browse our products page to discover great deals!";
    } else if (errorMessage.includes('timeout')) {
      return "I'm taking a bit longer than usual to think. Please try asking your question again.";
    } else {
      return "Sorry, I'm having a brief technical hiccup. Please try asking your question again in a moment.";
    }
  }
}

// New function that returns the full AI response including product recommendations
export async function getFullAiAssistantResponse(question: string) {
  if (!question) {
    return {
      answer: "Please ask a question.",
      recommendedProducts: []
    };
  }
  try {
    const response = await askQuestion({ question });
    return {
      answer: response.answer,
      recommendedProducts: response.recommendedProducts || []
    };
  } catch (error) {
    console.error('Error getting AI assistant response:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    let fallbackAnswer = "Sorry, I'm having a brief technical hiccup. Please try asking your question again in a moment.";
    
    if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
      fallbackAnswer = "I'm currently experiencing high traffic due to popular demand! 🔥 Please try asking your question again in a moment. While you wait, feel free to browse our products page to discover great deals!";
    } else if (errorMessage.includes('timeout')) {
      fallbackAnswer = "I'm taking a bit longer than usual to think. Please try asking your question again.";
    }
    
    return {
      answer: fallbackAnswer,
      recommendedProducts: []
    };
  }
}

async function getProductsFromFirestore(productNames: string[]): Promise<Product[]> {
    if (!productNames || productNames.length === 0) {
        return [];
    }
    const productsCollectionRef = collection(db, 'products');
    const q = query(productsCollectionRef, where('name', 'in', productNames));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getSmartCartSuggestions(purchaseHistory: string[], browsingHistory: string[]) {
    try {
        const response = await smartCartSuggestions({
            purchaseHistory: purchaseHistory.join(', '),
            browsingHistory: browsingHistory.join(', '),
        });
        const suggestedNames = response.suggestedItems.split(',').map(item => item.trim());
        
        if (!suggestedNames.length || (suggestedNames.length === 1 && suggestedNames[0] === '')) {
            return [];
        }

        const suggestedProducts = await getProductsFromFirestore(suggestedNames);

        return suggestedProducts;
    } catch (error) {
        console.error('Error getting smart cart suggestions:', error);
        return [];
    }
}

export async function generateVirtualTryOnImage(input: { personImage: string; productId: string }) {
    try {
        const response = await virtualTryOn(input);
        return { 
            success: true, 
            image: response.generatedImage,
            product: response.product
        };
    } catch (error) {
        console.error('Error generating virtual try-on image:', error);
        return { 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to generate image. Please try again.' 
        };
    }
}
