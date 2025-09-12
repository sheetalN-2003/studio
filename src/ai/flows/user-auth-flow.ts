
'use server';
/**
 * @fileOverview A user authentication AI agent for a hospital-grade platform.
 *
 * - login - A function that handles user login.
 * - signup - A function that handles doctor access requests.
 * - registerHospital - A function that handles new hospital and admin registration.
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
  hospitalName: z.string(),
  hospitalId: z.string(),
  department: z.string(),
  licenseId: z.string(),
  email: z.string().email(),
  password: z.string(),
});

const RegisterHospitalInputSchema = z.object({
    hospitalName: z.string().min(1, 'Hospital name is required'),
    hospitalEmail: z.string().email('A valid hospital email is required'),
    adminName: z.string().min(1, 'Admin name is required'),
    adminEmail: z.string().email('A valid admin email is required'),
    adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const ForgotPasswordInputSchema = z.object({
  email: z.string().email(),
});

const ApproveDoctorInputSchema = z.object({
    userId: z.string(),
});

const RejectDoctorInputSchema = z.object({
    userId: z.string(),
});

const SuspendDoctorInputSchema = z.object({
    userId: z.string(),
});


// Schemas for Output
const HospitalSchema = z.object({
    id: z.string(),
    name: z.string(),
    adminId: z.string(),
});
export type Hospital = z.infer<typeof HospitalSchema>;


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
  hospital: HospitalSchema.optional(),
});
export type AuthOutput = z.infer<typeof AuthOutputSchema>;

const AllDoctorsOutputSchema = z.object({
    doctors: z.array(UserSchema),
});


// Mock database of users and hospitals
const hospitals_db: Hospital[] = [
    { id: "H001", name: "General Hospital", adminId: "admin01" },
    { id: "H002", name: "City Clinic", adminId: "admin02" },
    { id: "H003", name: "Sunrise Medical", adminId: "admin03" },
];

const users_db: User[] = [
    {
      id: "admin01",
      email: "admin@med.example.com",
      // @ts-ignore
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
      // @ts-ignore
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
      // @ts-ignore
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
        // @ts-ignore
        password: 'password',
        name: 'Dr. Sarah Day',
        hospitalId: 'H001',
        hospitalName: 'General Hospital',
        role: 'Doctor',
        department: 'Pediatrics',
        licenseId: 'CL54321',
        status: 'pending',
        avatar: 'https://picsum.photos/seed/newdoc/100'
    },
    {
        id: 'suspended01',
        email: 'sus.pended@med.example.com',
        // @ts-ignore
        password: 'password',
        name: 'Dr. Susan Pended',
        hospitalId: 'H001',
        hospitalName: 'General Hospital',
        role: 'Doctor',
        department: 'Oncology',
        licenseId: 'CLSUS01',
        status: 'suspended',
        avatar: 'https://picsum.photos/seed/suspended/100'
    }
];

// Exported functions to be called from the UI
export async function login(input: z.infer<typeof LoginInputSchema>): Promise<AuthOutput> {
  return loginFlow(input);
}

export async function signup(input: z.infer<typeof SignupInputSchema>): Promise<Omit<AuthOutput, 'user'>> {
  return signupFlow(input);
}

export async function registerHospital(input: z.infer<typeof RegisterHospitalInputSchema>): Promise<AuthOutput> {
    return registerHospitalFlow(input);
}

export async function getAllDoctorsForAdmin(adminUserId: string): Promise<AllDoctorsOutputSchema> {
    return getAllDoctorsFlow({adminUserId});
}

export async function approveDoctor(input: z.infer<typeof ApproveDoctorInputSchema>): Promise<{success: boolean}> {
    return approveDoctorFlow(input);
}

export async function rejectDoctor(input: z.infer<typeof RejectDoctorInputSchema>): Promise<{success: boolean}> {
    return rejectDoctorFlow(input);
}

export async function suspendDoctor(input: z.infer<typeof SuspendDoctorInputSchema>): Promise<{success: boolean}> {
    return suspendDoctorFlow(input);
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
    const user = users_db.find(u => u.email === input.email && (u as any).password === input.password);
    
    if (user) {
        if (user.role === 'Doctor' && user.status !== 'approved') {
            if (user.status === 'pending') {
                return { success: false, message: 'Your account is pending approval. Please contact your hospital administrator.' };
            }
            if (user.status === 'rejected') {
                return { success: false, message: 'Your access request has been rejected.' };
            }
             if (user.status === 'suspended') {
                return { success: false, message: 'Your account has been suspended.' };
            }
        }
        
        // In a real app, you wouldn't send the password back
        const { password, ...userToReturn } = user as any;
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
    
    const hospital = hospitals_db.find(h => h.id.toLowerCase() === input.hospitalId.toLowerCase() && h.name.toLowerCase() === input.hospitalName.toLowerCase());
    if(!hospital) {
        return { success: false, message: `The provided Hospital Name and Hospital ID do not match a registered hospital. Please verify the details and try again.` };
    }

    const newUser: User & { password?: string } = {
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
    users_db.push(newUser as User);
    
    return { success: true, message: 'Your request has been sent to the hospital administrator for approval. You will be notified upon approval.' };
  }
);

// Hospital Registration Flow
const registerHospitalFlow = ai.defineFlow(
    {
        name: 'registerHospitalFlow',
        inputSchema: RegisterHospitalInputSchema,
        outputSchema: AuthOutputSchema,
    },
    async (input) => {
        console.log("New hospital registration:", input.hospitalName);

        const existingHospital = hospitals_db.find(h => h.name.toLowerCase() === input.hospitalName.toLowerCase());
        if (existingHospital) {
            return { success: false, message: `Hospital "${input.hospitalName}" is already registered.` };
        }

        const existingAdmin = users_db.find(u => u.email === input.adminEmail);
        if (existingAdmin) {
            return { success: false, message: "An account with this admin email already exists." };
        }
        
        const hospitalId = `H${String(hospitals_db.length + 1).padStart(3, '0')}`;
        const adminId = `admin_${hospitalId}`;
        
        const newAdmin: User & { password?: string } = {
            id: adminId,
            email: input.adminEmail,
            password: input.adminPassword,
            name: input.adminName,
            hospitalId: hospitalId,
            hospitalName: input.hospitalName,
            role: "Admin",
            specialty: "System Administrator",
            status: "approved",
            avatar: `https://picsum.photos/seed/${Math.random()}/110`,
        };

        const newHospital: Hospital = {
            id: hospitalId,
            name: input.hospitalName,
            adminId: adminId,
        };

        hospitals_db.push(newHospital);
        users_db.push(newAdmin as User);

        // In a real app, you wouldn't send the password back
        const { password, ...userToReturn } = newAdmin;
        
        return { success: true, message: "Hospital registered successfully.", user: userToReturn as User, hospital: newHospital };
    }
);


// Admin: Get All Doctors Flow
const getAllDoctorsFlow = ai.defineFlow(
    {
        name: 'getAllDoctorsFlow',
        inputSchema: z.object({ adminUserId: z.string() }),
        outputSchema: AllDoctorsOutputSchema,
    },
    async ({ adminUserId }) => {
        const admin = users_db.find(u => u.id === adminUserId);
        if (!admin || admin.role !== 'Admin') {
            return { doctors: [] };
        }

        const doctors = users_db.filter(u => u.hospitalId === admin.hospitalId && u.role === 'Doctor');
        return { doctors };
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

// Admin: Reject Doctor Flow
const rejectDoctorFlow = ai.defineFlow(
    {
        name: 'rejectDoctorFlow',
        inputSchema: RejectDoctorInputSchema,
        outputSchema: z.object({ success: z.boolean() }),
    },
    async ({ userId }) => {
        const userIndex = users_db.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            users_db[userIndex].status = 'rejected';
            console.log(`Doctor ${userId} rejected.`);
            // In a real app, send notification email here
            return { success: true };
        }
        return { success: false };
    }
);

// Admin: Suspend Doctor Flow
const suspendDoctorFlow = ai.defineFlow(
    {
        name: 'suspendDoctorFlow',
        inputSchema: SuspendDoctorInputSchema,
        outputSchema: z.object({ success: z.boolean() }),
    },
    async ({ userId }) => {
        const userIndex = users_db.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            users_db[userIndex].status = 'suspended';
            console.log(`Doctor ${userId} suspended.`);
            // In a real app, send notification email here
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
            // Don't reveal if user exists or not for security
            return { success: true, message: "If a user with that email exists, a reset link has been sent."}
        }
        
        // Simulate sending email
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
        // In a real app, this would invalidate a session token
        return { success: true, message: 'Logout successful' };
    }
);
