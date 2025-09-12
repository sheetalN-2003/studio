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
  role: z.string().optional().describe("The user's role (e.g., 'Admin', 'Doctor')."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response to the query."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  const {query, history = [], role} = input;

  let systemPrompt = `You are a helpful AI assistant for the GenoSym-AI application.
Your purpose is to answer questions from doctors and researchers about rare diseases, genetic data, and the application's features.
Be concise and helpful.`;

  if (role === 'Admin') {
    systemPrompt = `You are a helpful AI assistant for a hospital administrator using the GenoSym-AI application.
Your purpose is to provide quick, data-driven answers about platform usage, user management, and compliance.
When asked about user activity, you should synthesize information based on the audit logs and analytics data you have access to.
Be concise, professional, and data-focused in your responses.
For example, if asked "Which doctor used the most genomic data?", you should respond with a summary like: "Based on platform analytics, Dr. Emily Carter has initiated the most analyses involving genomic data in the last 7 days."
If asked about compliance, you can say: "The audit log shows all access and data operations are being tracked in real-time for compliance."
Do not answer questions outside the scope of platform administration.`;
  }


  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: query,
    history: history,
    system: systemPrompt,
  });

  return {response: llmResponse.text};
}
