'use server';
/**
 * @fileOverview A user authentication AI agent.
 *
 * - login - A function that handles user login.
 * - signup - A function that handles user signup.
 * - forgotPassword - A function that handles password reset requests.
 * - logout - A function that handles user logout.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schemas for Input
const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const SignupInputSchema = z.object({
  hospitalName: z.string(),
  email: z.string().email(),
  password: z.string(),
});

const ForgotPasswordInputSchema = z.object({
  email: z.string().email(),
});

// Schemas for Output
const AuthOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string().optional(),
});
export type AuthOutput = z.infer<typeof AuthOutputSchema>;


// Exported functions to be called from the UI
export async function login(input: z.infer<typeof LoginInputSchema>): Promise<AuthOutput> {
  return loginFlow(input);
}

export async function signup(input: z.infer<typeof SignupInputSchema>): Promise<AuthOutput> {
  return signupFlow(input);
}

export async function forgotPassword(input: z.infer<typeof ForgotPasswordInputSchema>): Promise<AuthOutput> {
    return forgotPasswordFlow(input);
}

export async function logout(): Promise<Omit<AuthOutput, 'userId'>> {
    return logoutFlow();
}

// Mock database of users
const users_db = [
    {
      id: "1",
      email: "test@example.com",
      password: "password", // In a real app, this would be a hash
      hospitalName: "General Hospital"
    }
]

// Login Flow
const loginFlow = ai.defineFlow(
  {
    name: 'loginFlow',
    inputSchema: LoginInputSchema,
    outputSchema: AuthOutputSchema,
  },
  async (input) => {
    console.log('Login attempt:', input.email);
    // This is a mock implementation. In a real app, you'd check against a database.
    const user = users_db.find(u => u.email === input.email && u.password === input.password);
    if (user) {
        return { success: true, message: 'Login successful', userId: user.id };
    } else {
        return { success: false, message: 'Invalid email or password' };
    }
  }
);


// Signup Flow
const signupFlow = ai.defineFlow(
  {
    name: 'signupFlow',
    inputSchema: SignupInputSchema,
    outputSchema: AuthOutputSchema,
  },
  async (input) => {
    console.log('Signup attempt:', input.email);
    // This is a mock implementation.
    const existingUser = users_db.find(u => u.email === input.email);
    if(existingUser){
        return { success: false, message: 'User with this email already exists.' };
    }
    
    // Add user to our mock db
    const newUser = {
        id: (users_db.length + 1).toString(),
        email: input.email,
        password: input.password,
        hospitalName: input.hospitalName
    }
    users_db.push(newUser)
    
    return { success: true, message: 'Signup successful' };
  }
);

// Forgot Password Flow
const forgotPasswordFlow = ai.defineFlow(
    {
        name: 'forgotPasswordFlow',
        inputSchema: ForgotPasswordInputSchema,
        outputSchema: AuthOutputSchema,
    },
    async (input) => {
        console.log('Forgot password for:', input.email);
        // This is a mock implementation. In a real app, you would send a password reset email.
        const existingUser = users_db.find(u => u.email === input.email);
        if(!existingUser) {
            // Still return success to not reveal if a user exists or not
            return { success: true, message: "If a user with that email exists, a reset link has been sent."}
        }
        
        return { success: true, message: "If a user with that email exists, a reset link has been sent." };
    }
);

// Logout Flow
const logoutFlow = ai.defineFlow(
    {
        name: 'logoutFlow',
        outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    },
    async () => {
        console.log('Logout attempt');
        // This is a mock implementation. In a real app, you'd invalidate a session/token.
        return { success: true, message: 'Logout successful' };
    }
);