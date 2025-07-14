// src/ai/flows/smart-cart-suggestions.ts
'use server';

/**
 * @fileOverview AI-powered smart cart suggestions flow.
 *
 * - smartCartSuggestions - A function that suggests items to add to the cart based on user's purchase history and browsing history.
 * - SmartCartSuggestionsInput - The input type for the smartCartSuggestions function.
 * - SmartCartSuggestionsOutput - The return type for the smartCartSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartCartSuggestionsInputSchema = z.object({
  purchaseHistory: z
    .string()
    .describe('A list of past purchases made by the user.'),
  browsingHistory: z
    .string()
    .describe('A list of items the user has recently viewed.'),
});
export type SmartCartSuggestionsInput = z.infer<typeof SmartCartSuggestionsInputSchema>;

const SmartCartSuggestionsOutputSchema = z.object({
  suggestedItems: z
    .string()
    .describe('A list of items suggested to add to the cart.'),
});
export type SmartCartSuggestionsOutput = z.infer<typeof SmartCartSuggestionsOutputSchema>;

export async function smartCartSuggestions(input: SmartCartSuggestionsInput): Promise<SmartCartSuggestionsOutput> {
  return smartCartSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartCartSuggestionsPrompt',
  input: {schema: SmartCartSuggestionsInputSchema},
  output: {schema: SmartCartSuggestionsOutputSchema},
  prompt: `Based on the user's purchase history and browsing history, suggest items that the user may want to add to their cart.

Purchase History: {{{purchaseHistory}}}
Browsing History: {{{browsingHistory}}}

Suggest items that are related to the user's past purchases and browsing history.
Return the suggested items as a comma-separated list.
`,
});

const smartCartSuggestionsFlow = ai.defineFlow(
  {
    name: 'smartCartSuggestionsFlow',
    inputSchema: SmartCartSuggestionsInputSchema,
    outputSchema: SmartCartSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
