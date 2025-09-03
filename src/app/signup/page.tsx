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
import { signup } from "@/ai/flows/user-auth-flow";

const formSchema = z.object({
  name: z.string().min(1, { message: "Full name is required." }),
  hospitalName: z.string().min(1, { message: "Hospital name is required." }),
  department: z.string().min(1, { message: "Department is required." }),
  licenseId: z.string().min(1, { message: "Medical license ID is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      hospitalName: "",
      department: "",
      licenseId: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await signup(values);
      if (result.success) {
        setIsSuccess(true);
      } else {
        toast({
          variant: "destructive",
          title: "Request Failed",
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Signup failed:", error);
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="mb-8 flex items-center gap-2 text-2xl font-semibold">
                <Logo className="size-8" />
                <h1>GenoSym-AI</h1>
            </div>
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                <CardTitle className="text-2xl">Request Submitted</CardTitle>
                <CardDescription>
                    Thank you for your request. Your hospital administrator has been notified. You will receive an email once your account is approved.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/login" className="w-full">
                        <Button className="w-full">
                            Return to Login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
      </div>
    )
  }

  return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2 text-2xl font-semibold">
        <Logo className="size-8" />
        <h1>GenoSym-AI</h1>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Request Doctor Access</CardTitle>
          <CardDescription>
            Submit your information to request access from your hospital admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Dr. John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="hospitalName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hospital Name</FormLabel>
                        <FormControl>
                        <Input placeholder="General Hospital" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                        <Input placeholder="Cardiology" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="licenseId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>License ID</FormLabel>
                        <FormControl>
                        <Input placeholder="CL12345" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="doctor@hospital.com"
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
                Request Access
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an approved account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
