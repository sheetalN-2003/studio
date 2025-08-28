'use server';
/**
 * @fileOverview An AI agent for answering user queries.
 *
 * - chat - A function that handles user chat queries.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  query: z.string().describe("The user's query."),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({text: z.string()})),
      })
    )
    .optional()
    .describe('The chat history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response to the query."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  const {query, history = []} = input;

  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: query,
    history: history,
    system: `You are a helpful AI assistant for the GenoSym-AI application.
Your purpose is to answer questions from doctors and researchers about rare diseases, genetic data, and the application's features.
Be concise and helpful.
`,
  });

  return {response: llmResponse.text};
}
