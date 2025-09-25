'use server';
/**
 * @fileOverview A flow for handling chat messages within a case board.
 *
 * - sendMessage - A function that saves a chat message to Firestore.
 */
import { initializeFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import type { User } from './user-auth-flow';

const ChatMessageInputSchema = z.object({
  caseId: z.string(),
  user: z.custom<User>(),
  content: z.string(),
});

const ChatMessageOutputSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
});

export async function sendMessage(input: z.infer<typeof ChatMessageInputSchema>): Promise<z.infer<typeof ChatMessageOutputSchema>> {
  return sendMessageFlow(input);
}

const sendMessageFlow = ai.defineFlow(
  {
    name: 'sendMessageFlow',
    inputSchema: ChatMessageInputSchema,
    outputSchema: ChatMessageOutputSchema,
  },
  async ({ caseId, user, content }) => {
    try {
      const { firestore } = initializeFirebase();
      const messagesColRef = collection(firestore, 'cases', caseId, 'messages');
      
      const docRef = await addDoc(messagesColRef, {
        content,
        timestamp: serverTimestamp(),
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
      });

      return { success: true, messageId: docRef.id };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false };
    }
  }
);
