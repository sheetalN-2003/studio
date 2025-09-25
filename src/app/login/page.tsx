
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/icons";
import { login } from "@/ai/flows/user-auth-flow";
import { useAuth as useFirebaseAuth } from '@/context/auth-context';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';


const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useFirebaseAuth();
  const { auth: firebaseAuth } = useFirebase();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Step 1: Validate user status on the server
      const serverResult = await login(values);

      if (!serverResult.success) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: serverResult.message,
        });
        setIsLoading(false);
        return;
      }

      // Step 2: If server validation passes, sign in on the client
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, values.email, values.password);
      
      // The onAuthStateChanged listener in AuthProvider will handle the redirect
      toast({
        title: "Login Successful",
        description: `Welcome back!`,
      });

    } catch (error: any) {
      console.error("Login failed:", error);
      let message = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          message = "Invalid email or password.";
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  // If user is already loaded and logged in, AuthGuard will redirect them.
  // We can show a simple loading state or null while that happens.
  if (user) {
      return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2 text-2xl font-semibold">
        <Logo className="size-8" />
        <h1>GenoSym-AI</h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Member Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                     <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Need an account?
          </div>
          <div className="mt-2 text-center text-sm">
            <Link href="/signup" className="underline font-medium">
              Request Doctor Access
            </Link>
             <span className="mx-2 text-muted-foreground">or</span>
            <Link href="/register-hospital" className="underline font-medium">
              Register your Hospital
            </Link>
          </div>
           <div className="mt-4 text-center text-sm">
            <Link href="/forgot-password"className="underline">
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
