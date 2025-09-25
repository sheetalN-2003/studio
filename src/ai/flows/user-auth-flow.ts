'use server';
import 'server-only';
/**
 * @fileOverview A user authentication flow using Firebase.
 *
 * - login - A function that handles user login.
 * - signup - A function that handles doctor access requests.
 * - registerHospital - A function that handles new hospital and admin registration.
 * - getPendingRequests - Fetches pending doctor access requests for an admin.
 * - approveDoctor - Approves a doctor's access request.
 * - forgotPassword - A function that handles password reset requests.
 * - logout - A function that handles user logout.
 */

import { z } from 'zod';
import { initializeServerSideFirebase } from '@/firebase/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

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
    domain: z.string().optional(),
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
  token: z.string().optional(),
});
export type AuthOutput = z.infer<typeof AuthOutputSchema>;

const AllDoctorsOutputSchema = z.object({
    doctors: z.array(UserSchema),
});

// This is a client-side concern now. We return a token for the client to handle.
export async function login(input: z.infer<typeof LoginInputSchema>): Promise<Omit<AuthOutput, 'user'>> {
    // Note: This function can't fully log a user in from the server side with the client-side SDK.
    // A proper implementation would use custom tokens.
    // For this prototype, we'll just validate the user exists and is approved.
    try {
        const { auth, firestore } = initializeServerSideFirebase();
        const userRecord = await auth.getUserByEmail(input.email);

        if (!userRecord.emailVerified) {
            return { success: false, message: "Please verify your email before logging in." };
        }
        
        const userDocRef = firestore.collection("users").doc(userRecord.uid);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
            const userData = userDoc.data() as User;
             if (userData.role === 'Doctor' && userData.status !== 'approved') {
                return { success: false, message: `Your account is ${userData.status}. Please contact your administrator.` };
            }
            // In a real app, you would verify the password and generate a custom token.
            // For now, we assume if they exist in Admin SDK, they are valid, and client will do the sign-in.
            return { success: true, message: 'User validated. Client should now sign in.' };
        } else {
            return { success: false, message: 'User profile not found.' };
        }
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
             return { success: false, message: 'Invalid email or password' };
        }
        console.error("Server-side login validation error:", error);
        return { success: false, message: error.message || 'Invalid email or password' };
    }
}

export async function signup(input: z.infer<typeof SignupInputSchema>): Promise<Omit<AuthOutput, 'user'>> {
  try {
        const { auth, firestore } = initializeServerSideFirebase();

        const hospitalRef = firestore.collection('hospitals').doc(input.hospitalId);
        const hospitalDoc = await hospitalRef.get();

        if (!hospitalDoc.exists() || hospitalDoc.data()?.name.toLowerCase() !== input.hospitalName.toLowerCase()) {
            return { success: false, message: `The provided Hospital Name and Hospital ID do not match a registered hospital. Please verify the details and try again.` };
        }

        const userRecord = await auth.createUser({
            email: input.email,
            password: input.password,
            emailVerified: false, // User must verify their email
        });
        
        // This generates a link that can be sent in an email.
        const verificationLink = await auth.generateEmailVerificationLink(input.email);
        // TODO: In a real app, you would use an email service (e.g., SendGrid) to send this link.
        console.log("SEND VERIFICATION EMAIL (mock): ", verificationLink);

        const newUser: Omit<User, 'id'> = {
            email: input.email,
            name: input.name,
            hospitalId: hospitalDoc.id,
            hospitalName: hospitalDoc.data()?.name,
            role: "Doctor",
            department: input.department,
            licenseId: input.licenseId,
            status: "pending",
            avatar: `https://picsum.photos/seed/${Math.random()}/100`
        };

        await firestore.collection("users").doc(userRecord.uid).set(newUser);

        return { success: true, message: 'A verification link has been sent to your email. Please verify your email, and then your request will be submitted for administrative review.' };
    } catch (error: any) {
         console.error("Firebase signup error:", error);
         if (error.code === 'auth/email-already-exists') {
            return { success: false, message: 'An account with this email already exists.' };
         }
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}

export async function registerHospital(input: z.infer<typeof RegisterHospitalInputSchema>): Promise<AuthOutput> {
    try {
        const { auth, firestore } = initializeServerSideFirebase();
        
        const hospitalsQuery = firestore.collection('hospitals').where('name', '==', input.hospitalName);
        const existingHospitals = await hospitalsQuery.get();
        if (!existingHospitals.empty) {
            return { success: false, message: `Hospital "${input.hospitalName}" is already registered.` };
        }
        
        const adminUserRecord = await auth.createUser({
            email: input.adminEmail,
            password: input.adminPassword,
            emailVerified: false,
        });

        const verificationLink = await auth.generateEmailVerificationLink(input.adminEmail);
        console.log("SEND VERIFICATION EMAIL (mock): ", verificationLink);

        const hospitalId = `H${String(Math.floor(Math.random() * 900) + 100)}`;
        const hospitalDomain = input.hospitalEmail.split('@')[1];

        const newHospital: Omit<Hospital, 'id'> = {
            name: input.hospitalName,
            adminId: adminUserRecord.uid,
            domain: hospitalDomain,
        };
        await firestore.collection('hospitals').doc(hospitalId).set(newHospital);

        const newAdmin: Omit<User, 'id'> = {
            email: input.adminEmail,
            name: input.adminName,
            hospitalId: hospitalId,
            hospitalName: input.hospitalName,
            role: "Admin",
            specialty: "System Administrator",
            status: "approved",
            avatar: `https://picsum.photos/seed/${Math.random()}/110`,
        };
        await firestore.collection("users").doc(adminUserRecord.uid).set(newAdmin);
        
        const hospitalData: Hospital = { ...newHospital, id: hospitalId };
        const adminData: User = { ...newAdmin, id: adminUserRecord.uid };

        return { success: true, message: "Hospital registered successfully. A verification email has been sent to the administrator's email.", user: adminData, hospital: hospitalData };

    } catch (error: any) {
        console.error("Firebase hospital registration error:", error);
        if (error.code === 'auth/email-already-exists') {
            return { success: false, message: 'An account with this admin email already exists.' };
        }
        return { success: false, message: error.message || "An unexpected error occurred." };
    }
}

export async function getAllDoctorsForAdmin(adminUserId: string): Promise<AllDoctorsOutputSchema> {
    try {
        const { firestore } = initializeServerSideFirebase();
        const adminDocRef = firestore.collection('users').doc(adminUserId);
        const adminDoc = await adminDocRef.get();

        if (!adminDoc.exists || adminDoc.data()?.role !== 'Admin') {
            return { doctors: [] };
        }

        const hospitalId = adminDoc.data()?.hospitalId;
        const doctorsQuery = firestore.collection('users').where('hospitalId', '==', hospitalId).where('role', '==', 'Doctor');
        
        const querySnapshot = await doctorsQuery.get();
        const doctors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

        return { doctors };
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return { doctors: [] };
    }
}

export async function approveDoctor(input: z.infer<typeof ApproveDoctorInputSchema>): Promise<{success: boolean}> {
    try {
        const { firestore } = initializeServerSideFirebase();
        const userDocRef = firestore.collection('users').doc(input.userId);
        await userDocRef.update({ status: 'approved' });
        console.log(`Doctor ${input.userId} approved.`);
        return { success: true };
   } catch (error) {
        console.error("Error approving doctor:", error);
        return { success: false };
   }
}

export async function rejectDoctor(input: z.infer<typeof RejectDoctorInputSchema>): Promise<{success: boolean}> {
    try {
        const { firestore } = initializeServerSideFirebase();
        const userDocRef = firestore.collection('users').doc(input.userId);
        await userDocRef.update({ status: 'rejected' });
        console.log(`Doctor ${input.userId} rejected.`);
        return { success: true };
     } catch (error) {
        console.error("Error rejecting doctor:", error);
        return { success: false };
     }
}

export async function suspendDoctor(input: z.infer<typeof SuspendDoctorInputSchema>): Promise<{success: boolean}> {
    try {
        const { firestore } = initializeServerSideFirebase();
        const userDocRef = firestore.collection('users').doc(input.userId);
        await userDocRef.update({ status: 'suspended' });
        console.log(`Doctor ${input.userId} suspended.`);
        return { success: true };
    } catch (error) {
        console.error("Error suspending doctor:", error);
        return { success: false };
    }
}

export async function forgotPassword(input: z.infer<typeof ForgotPasswordInputSchema>): Promise<Omit<AuthOutput, 'user'>> {
    try {
        // Password reset must be initiated from the client-side SDK.
        // This server-side function just provides a consistent interface.
        // The client will call the actual Firebase method.
        return { success: true, message: "Client should now initiate password reset email." };
    } catch (error: any) {
        console.error("Forgot password flow error:", error);
        return { success: false, message: "An error occurred." };
    }
}

export async function logout(): Promise<Omit<AuthOutput, 'user'>> {
    // Logout is a client-side action.
    return { success: true, message: 'Client should now sign out.' };
}
