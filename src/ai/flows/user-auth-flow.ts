'use server';
/**
 * @fileOverview A user authentication AI agent for a hospital-grade platform.
 *
 * - login - A function that handles user login.
 * - signup - A function that handles doctor access requests.
 * - getPendingRequests - Fetches pending doctor access requests for an admin.
 * - approveDoctor - Approves a doctor's access request.
 * - forgotPassword - A function that handles password reset requests.
 * - logout - A function that handles user logout.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schemas for Input
const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const SignupInputSchema = z.object({
  name: z.string(),
  hospitalName: z.string(), // For now, we'll use this to find the hospitalId
  department: z.string(),
  licenseId: z.string(),
  email: z.string().email(),
  password: z.string(),
});

const ForgotPasswordInputSchema = z.object({
  email: z.string().email(),
});

const ApproveDoctorInputSchema = z.object({
    userId: z.string(),
});

// Schemas for Output
const UserSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.string(),
    specialty: z.string().optional(),
    hospitalName: z.string(),
    hospitalId: z.string(),
    department: z.string().optional(),
    licenseId: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'suspended']),
    avatar: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;


const AuthOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: UserSchema.optional(),
});
export type AuthOutput = z.infer<typeof AuthOutputSchema>;

const PendingRequestsOutputSchema = z.object({
    requests: z.array(UserSchema),
});


// Mock database of users and hospitals
const hospitals_db = [
    { id: "H001", name: "General Hospital", adminId: "admin01" },
    { id: "H002", name: "City Clinic", adminId: "admin02" },
    { id: "H003", name: "Sunrise Medical", adminId: "admin03" },
];

const users_db: User[] = [
    {
      id: "admin01",
      email: "admin@med.example.com",
      password: "adminpass",
      name: "Dr. Admin User",
      hospitalId: "H001",
      hospitalName: "General Hospital",
      role: "Admin",
      specialty: "System Administrator",
      status: "approved",
      avatar: "https://picsum.photos/110"
    },
    {
      id: "1",
      email: "emily.carter@med.example.com",
      password: "password", // In a real app, this would be a hash
      name: "Dr. Emily Carter",
      hospitalId: "H001",
      hospitalName: "General Hospital",
      department: "Cardiology",
      licenseId: "CL12345",
      role: "Doctor",
      specialty: "Cardiologist",
      status: "approved",
      avatar: "https://picsum.photos/100"
    },
    {
      id: "2",
      email: "ben.zhang@med.example.com",
      password: "password",
      name: "Dr. Ben Zhang",
      hospitalId: "H002",
      hospitalName: "City Clinic",
      department: "Neurology",
      licenseId: "CL67890",
      role: "Doctor",
      specialty: "Neurologist",
      status: "approved",
      avatar: "https://picsum.photos/101",
    },
    {
        id: 'pending01',
        email: 'new.doctor@med.example.com',
        password: 'password',
        name: 'Dr. Sarah Day',
        hospitalId: 'H001',
        hospitalName: 'General Hospital',
        role: 'Doctor',
        department: 'Pediatrics',
        licenseId: 'CL54321',
        status: 'pending',
        avatar: 'https://picsum.photos/seed/newdoc/100'
    }
];

// Exported functions to be called from the UI
export async function login(input: z.infer<typeof LoginInputSchema>): Promise<AuthOutput> {
  return loginFlow(input);
}

export async function signup(input: z.infer<typeof SignupInputSchema>): Promise<Omit<AuthOutput, 'user'>> {
  return signupFlow(input);
}

export async function getPendingRequests(adminUserId: string): Promise<PendingRequestsOutputSchema> {
    return getPendingRequestsFlow({adminUserId});
}

export async function approveDoctor(input: z.infer<typeof ApproveDoctorInputSchema>): Promise<{success: boolean}> {
    return approveDoctorFlow(input);
}

export async function forgotPassword(input: z.infer<typeof ForgotPasswordInputSchema>): Promise<Omit<AuthOutput, 'user'>> {
    return forgotPasswordFlow(input);
}

export async function logout(): Promise<Omit<AuthOutput, 'user'>> {
    return logoutFlow();
}


// Login Flow
const loginFlow = ai.defineFlow(
  {
    name: 'loginFlow',
    inputSchema: LoginInputSchema,
    outputSchema: AuthOutputSchema,
  },
  async (input) => {
    console.log('Login attempt:', input.email);
    const user = users_db.find(u => u.email === input.email && u.password === input.password);
    
    if (user) {
        if (user.role === 'Doctor' && user.status !== 'approved') {
            return { success: false, message: 'Your account is pending approval. Please contact your hospital administrator.' };
        }
        if (user.status === 'suspended') {
            return { success: false, message: 'Your account has been suspended.' };
        }
        
        // In a real app, you wouldn't send the password back
        const { password, ...userToReturn } = user;
        return { success: true, message: 'Login successful', user: userToReturn as User };
    } else {
        return { success: false, message: 'Invalid email or password' };
    }
  }
);


// Signup Flow (Doctor Access Request)
const signupFlow = ai.defineFlow(
  {
    name: 'signupFlow',
    inputSchema: SignupInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (input) => {
    console.log('Doctor access request from:', input.email);
    const existingUser = users_db.find(u => u.email === input.email);
    if(existingUser){
        return { success: false, message: 'An account with this email already exists.' };
    }
    
    const hospital = hospitals_db.find(h => h.name.toLowerCase() === input.hospitalName.toLowerCase());
    if(!hospital) {
        return { success: false, message: `Hospital "${input.hospitalName}" is not registered.` };
    }

    const newUser: User = {
        id: `user_${(users_db.length + 1)}`,
        email: input.email,
        password: input.password,
        name: input.name,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        role: "Doctor",
        department: input.department,
        licenseId: input.licenseId,
        status: "pending", // Doctors start as pending
        avatar: `https://picsum.photos/seed/${Math.random()}/100`
    }
    users_db.push(newUser);
    
    return { success: true, message: 'Your access request has been submitted. You will receive an email upon approval.' };
  }
);

// Admin: Get Pending Requests Flow
const getPendingRequestsFlow = ai.defineFlow(
    {
        name: 'getPendingRequestsFlow',
        inputSchema: z.object({ adminUserId: z.string() }),
        outputSchema: PendingRequestsOutputSchema,
    },
    async ({ adminUserId }) => {
        const admin = users_db.find(u => u.id === adminUserId);
        if (!admin || admin.role !== 'Admin') {
            return { requests: [] };
        }

        const requests = users_db.filter(u => u.hospitalId === admin.hospitalId && u.status === 'pending');
        return { requests };
    }
);


// Admin: Approve Doctor Flow
const approveDoctorFlow = ai.defineFlow(
    {
        name: 'approveDoctorFlow',
        inputSchema: ApproveDoctorInputSchema,
        outputSchema: z.object({ success: z.boolean() }),
    },
    async ({ userId }) => {
        const userIndex = users_db.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            users_db[userIndex].status = 'approved';
            console.log(`Doctor ${userId} approved.`);
            // In a real app, send confirmation email here
            return { success: true };
        }
        return { success: false };
    }
);


// Forgot Password Flow
const forgotPasswordFlow = ai.defineFlow(
    {
        name: 'forgotPasswordFlow',
        inputSchema: ForgotPasswordInputSchema,
        outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    },
    async (input) => {
        console.log('Forgot password for:', input.email);
        const existingUser = users_db.find(u => u.email === input.email);
        if(!existingUser) {
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
        return { success: true, message: 'Logout successful' };
    }
);
