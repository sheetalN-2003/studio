
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
import { Loader2, PartyPopper, Copy } from "lucide-react";
import { Logo } from "@/components/icons";
import { registerHospital, type User, type Hospital } from "@/ai/flows/user-auth-flow";
import { useAuth } from "@/context/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
    hospitalName: z.string().min(1, 'Hospital name is required'),
    hospitalEmail: z.string().email('A valid hospital email is required'),
    adminName: z.string().min(1, 'Admin name is required'),
    adminEmail: z.string().email('A valid admin email is required'),
    adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function RegisterHospitalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{user: User, hospital: Hospital} | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        hospitalName: "",
        hospitalEmail: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await registerHospital(values);
      if (result.success && result.user && result.hospital) {
        toast({
          title: "Registration Successful",
          description: `Welcome, ${result.user.name}! Your hospital is registered.`,
        });
        setRegistrationResult({ user: result.user, hospital: result.hospital });
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Hospital registration failed:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Hospital ID has been copied.",
    });
  };

  if (registrationResult) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="mb-8 flex items-center gap-2 text-2xl font-semibold">
                <Logo className="size-8" />
                <h1>GenoSym-AI</h1>
            </div>
            <Card className="w-full max-w-lg">
                <CardHeader className="items-center text-center">
                    <PartyPopper className="h-12 w-12 text-primary" />
                    <CardTitle className="text-2xl">Registration Complete!</CardTitle>
                    <CardDescription>
                        Your hospital is now registered on the GenoSym-AI platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertTitle className="font-bold">Your Unique Hospital ID</AlertTitle>
                        <AlertDescription>
                            Share this ID with doctors at your institution. They will need it to request access.
                        </AlertDescription>
                         <div className="my-4 flex items-center justify-center gap-2 rounded-md bg-muted p-3">
                            <span className="text-2xl font-bold tracking-widest text-primary">{registrationResult.hospital.id}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(registrationResult.hospital.id)}>
                                <Copy className="h-5 w-5" />
                            </Button>
                        </div>
                    </Alert>
                    <Link href="/login" className="w-full">
                        <Button className="w-full" size="lg">
                            Proceed to Login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2 text-2xl font-semibold">
        <Logo className="size-8" />
        <h1>GenoSym-AI</h1>
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Register Your Hospital</CardTitle>
          <CardDescription>
            Create a new hospital account and an administrator profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <h3 className="font-semibold">Hospital Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="hospitalName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hospital Name</FormLabel>
                                <FormControl>
                                <Input placeholder="City General Hospital" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hospitalEmail"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Official Hospital Email</FormLabel>
                                <FormControl>
                                <Input placeholder="contact@citygeneral.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                </div>

                 <div className="space-y-2 pt-4">
                    <h3 className="font-semibold">Administrator Account</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="adminName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Admin Full Name</FormLabel>
                                <FormControl>
                                <Input placeholder="Dr. Jane Smith" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="adminEmail"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Admin Email</FormLabel>
                                <FormControl>
                                <Input type="email" placeholder="admin@citygeneral.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="adminPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Admin Password</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Hospital
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    