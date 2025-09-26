
'use server';
import 'server-only';

/**
 * @fileOverview A flow for handling chat messages within a case board.
 *
 * - sendMessage - A function that saves a chat message to Firestore.
 */
import { firestore } from '@/firebase/server';
import { serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
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
  if (!firestore) {
    throw new Error('Firestore is not initialized on the server.');
  }
  const { caseId, user, content } = input;
  try {
    const messagesColRef = firestore.collection('cases').doc(caseId).collection('messages');
    
    const docRef = await messagesColRef.add({
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
