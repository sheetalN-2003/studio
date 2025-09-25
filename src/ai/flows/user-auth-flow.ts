
'use server';
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

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    signOut,
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

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
});
export type AuthOutput = z.infer<typeof AuthOutputSchema>;

const AllDoctorsOutputSchema = z.object({
    doctors: z.array(UserSchema),
});

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
    try {
        const { firestore, auth: firebaseAuth } = initializeFirebase();
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, input.email, input.password);
        const user = userCredential.user;

        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data() as User;
             if (userData.role === 'Doctor' && userData.status !== 'approved') {
                if (userData.status === 'pending') {
                    return { success: false, message: 'Your account is pending approval. Please contact your hospital administrator.' };
                }
                if (userData.status === 'rejected') {
                    return { success: false, message: 'Your access request has been rejected.' };
                }
                if (userData.status === 'suspended') {
                    return { success: false, message: 'Your account has been suspended.' };
                }
            }
            return { success: true, message: 'Login successful', user: { ...userData, id: user.uid } };
        } else {
            return { success: false, message: 'User profile not found.' };
        }
    } catch (error: any) {
        console.error("Firebase login error:", error);
        return { success: false, message: error.message || 'Invalid email or password' };
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
     try {
        const { firestore, auth: firebaseAuth, firebaseApp } = initializeFirebase();
        // Check if hospital exists
        const hospitalRef = doc(firestore, 'hospitals', input.hospitalId);
        const hospitalDoc = await getDoc(hospitalRef);

        if (!hospitalDoc.exists() || hospitalDoc.data().name.toLowerCase() !== input.hospitalName.toLowerCase()) {
            return { success: false, message: `The provided Hospital Name and Hospital ID do not match a registered hospital. Please verify the details and try again.` };
        }

        // We create the user in Firebase Auth but don't sign them in.
        // We'll use a temporary, secondary Firebase app instance for this to avoid affecting the main app's auth state.
        const tempAuth = getAuth(firebaseApp);
        const userCredential = await createUserWithEmailAndPassword(tempAuth, input.email, input.password);
        const user = userCredential.user;
        
        const newUser: Omit<User, 'id'> = {
            email: input.email,
            name: input.name,
            hospitalId: hospitalDoc.id,
            hospitalName: hospitalDoc.data().name,
            role: "Doctor",
            department: input.department,
            licenseId: input.licenseId,
            status: "pending",
            avatar: `https://picsum.photos/seed/${Math.random()}/100`
        };

        // Create user document in Firestore
        await setDoc(doc(firestore, "users", user.uid), newUser);

        return { success: true, message: 'Your request for access has been submitted for administrative review. You can try logging in later after approval.' };
    } catch (error: any) {
         console.error("Firebase signup error:", error);
         if (error.code === 'auth/email-already-in-use') {
            return { success: false, message: 'An account with this email already exists.' };
         }
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
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
        try {
            const { firestore, auth: firebaseAuth } = initializeFirebase();
            // Check if hospital name is unique
            const hospitalsQuery = query(collection(firestore, 'hospitals'), where('name', '==', input.hospitalName));
            const existingHospitals = await getDocs(hospitalsQuery);
            if (!existingHospitals.empty) {
                return { success: false, message: `Hospital "${input.hospitalName}" is already registered.` };
            }

            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, input.adminEmail, input.adminPassword);
            const adminUser = userCredential.user;

            const hospitalId = `H${String(Math.floor(Math.random() * 900) + 100)}`;
            const hospitalDomain = input.hospitalEmail.split('@')[1];

            const newHospital: Omit<Hospital, 'id'> = {
                name: input.hospitalName,
                adminId: adminUser.uid,
                domain: hospitalDomain,
            };
            await setDoc(doc(firestore, 'hospitals', hospitalId), newHospital);

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
            await setDoc(doc(firestore, "users", adminUser.uid), newAdmin);
            
            const hospitalData: Hospital = { ...newHospital, id: hospitalId };
            const adminData: User = { ...newAdmin, id: adminUser.uid };

            return { success: true, message: "Hospital registered successfully.", user: adminData, hospital: hospitalData };

        } catch (error: any) {
            console.error("Firebase hospital registration error:", error);
            if (error.code === 'auth/email-already-in-use') {
                return { success: false, message: 'An account with this admin email already exists.' };
            }
            return { success: false, message: error.message || "An unexpected error occurred." };
        }
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
        try {
            const { firestore } = initializeFirebase();
            const adminDocRef = doc(firestore, 'users', adminUserId);
            const adminDoc = await getDoc(adminDocRef);

            if (!adminDoc.exists() || adminDoc.data().role !== 'Admin') {
                return { doctors: [] };
            }

            const hospitalId = adminDoc.data().hospitalId;
            const doctorsQuery = query(collection(firestore, 'users'), where('hospitalId', '==', hospitalId), where('role', '==', 'Doctor'));
            
            const querySnapshot = await getDocs(doctorsQuery);
            const doctors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

            return { doctors };
        } catch (error) {
            console.error("Error fetching doctors:", error);
            return { doctors: [] };
        }
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
       try {
            const { firestore } = initializeFirebase();
            const userDocRef = doc(firestore, 'users', userId);
            await updateDoc(userDocRef, { status: 'approved' });
            console.log(`Doctor ${userId} approved.`);
            return { success: true };
       } catch (error) {
            console.error("Error approving doctor:", error);
            return { success: false };
       }
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
         try {
            const { firestore } = initializeFirebase();
            const userDocRef = doc(firestore, 'users', userId);
            await updateDoc(userDocRef, { status: 'rejected' });
            console.log(`Doctor ${userId} rejected.`);
            return { success: true };
         } catch (error) {
            console.error("Error rejecting doctor:", error);
            return { success: false };
         }
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
        try {
            const { firestore } = initializeFirebase();
            const userDocRef = doc(firestore, 'users', userId);
            await updateDoc(userDocRef, { status: 'suspended' });
            console.log(`Doctor ${userId} suspended.`);
            return { success: true };
        } catch (error) {
            console.error("Error suspending doctor:", error);
            return { success: false };
        }
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
        try {
            const { auth: firebaseAuth } = initializeFirebase();
            await sendPasswordResetEmail(firebaseAuth, input.email);
            return { success: true, message: "If a user with that email exists, a reset link has been sent." };
        } catch (error: any) {
            console.error("Forgot password error:", error);
            // Don't reveal if user exists.
            return { success: true, message: "If a user with that email exists, a reset link has been sent." };
        }
    }
);

// Logout Flow
const logoutFlow = ai.defineFlow(
    {
        name: 'logoutFlow',
        outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    },
    async () => {
        try {
            const { auth: firebaseAuth } = initializeFirebase();
            await signOut(firebaseAuth);
            return { success: true, message: 'Logout successful' };
        } catch (error: any) {
            console.error("Logout error:", error);
            return { success: false, message: "Logout failed." };
        }
    }
);

    