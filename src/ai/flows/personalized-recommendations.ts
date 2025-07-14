
// src/ai/flows/personalized-recommendations.ts
'use server';

/**
 * @fileOverview A personalized product recommendation AI agent.
 *
 * - generatePersonalizedRecommendations - A function that generates personalized product recommendations.
 * - PersonalizedRecommendationsInput - The input type for the generatePersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the generatePersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  userHistory: z
    .string()
    .describe(
      'A detailed history of the users past purchases and browsing activity.'
    ),
  productCatalog: z.string().describe('A list of available products.'),
});
export type PersonalizedRecommendationsInput = z.infer<
  typeof PersonalizedRecommendationsInputSchema
>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe(
      'A list of personalized product recommendations based on user history.'
    ),
});
export type PersonalizedRecommendationsOutput = z.infer<
  typeof PersonalizedRecommendationsOutputSchema
>;

export async function generatePersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are an expert shopping assistant specializing in product recommendations.

  Based on the user's past shopping history and available products,
  you will recommend products that the user would be most interested in.

  User History: {{{userHistory}}}
  Available Products: {{{productCatalog}}}

  Please provide a list of product recommendations in the specified format.
  `, // Added Handlebars syntax
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    let retries = 3;
    while (retries > 0) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (e: any) {
        if (e.message && e.message.includes('503 Service Unavailable') && retries > 1) {
          console.log('Model overloaded, retrying...');
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s before retrying
        } else {
          // For any other error, or if retries are exhausted, throw it
          throw e;
        }
      }
    }
    // This part should not be reachable if an error is always thrown on the last attempt,
    // but as a fallback, return empty recommendations.
    return { recommendations: [] };
  }
);
