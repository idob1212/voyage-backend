"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, AlertCircle, CheckCircle, Briefcase, Building2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { UserType } from "@/types";
import { signIn } from "next-auth/react";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  userType: z.enum([UserType.TRAVEL_AGENT, UserType.DMC_AGENT]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedType = searchParams.get("type") as UserType;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      userType: preselectedType || UserType.TRAVEL_AGENT,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.register({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        user_type: data.userType,
      });

      setSuccess(true);
      toast.success("Account created successfully!", {
        description: "You can now sign in with your new account.",
      });

      // Auto-login after successful registration
      setTimeout(async () => {
        await signIn("credentials", {
          email: data.email,
          password: data.password,
          callbackUrl: data.userType === UserType.TRAVEL_AGENT 
            ? "/dashboard/travel-agent"
            : "/dashboard/dmc-agent",
        });
      }, 1500);
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "An error occurred during registration. Please try again.");
      toast.error("Registration failed", {
        description: error.message || "Please check your information and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <MainLayout showFooter={false}>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Account Created Successfully!</h2>
                  <p className="text-sm text-muted-foreground">
                    Your account has been created. You&apos;re being signed in automatically...
                  </p>
                  <LoadingSpinner size="md" className="mx-auto" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <div className="font-serif text-3xl font-bold text-primary">
                Voyage
              </div>
            </Link>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Join our community of travel professionals
            </p>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-center">Sign up</CardTitle>
              <CardDescription className="text-center">
                Choose your account type and create your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* User Type Selection */}
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I am a...</FormLabel>
                        <div className="grid grid-cols-1 gap-3">
                          <label
                            className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                              field.value === UserType.TRAVEL_AGENT
                                ? "border-primary bg-primary/5"
                                : "border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              value={UserType.TRAVEL_AGENT}
                              checked={field.value === UserType.TRAVEL_AGENT}
                              onChange={() => field.onChange(UserType.TRAVEL_AGENT)}
                              className="sr-only"
                            />
                            <div className="flex items-center">
                              <Briefcase className="h-5 w-5 text-primary mr-3" />
                              <div>
                                <div className="text-sm font-medium">Travel Agent</div>
                                <div className="text-xs text-muted-foreground">
                                  Book hotels for your clients
                                </div>
                              </div>
                            </div>
                          </label>
                          
                          <label
                            className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                              field.value === UserType.DMC_AGENT
                                ? "border-primary bg-primary/5"
                                : "border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              value={UserType.DMC_AGENT}
                              checked={field.value === UserType.DMC_AGENT}
                              onChange={() => field.onChange(UserType.DMC_AGENT)}
                              className="sr-only"
                            />
                            <div className="flex items-center">
                              <Building2 className="h-5 w-5 text-primary mr-3" />
                              <div>
                                <div className="text-sm font-medium">DMC Agent</div>
                                <div className="text-xs text-muted-foreground">
                                  Manage hotel inventory & quotes
                                </div>
                              </div>
                            </div>
                          </label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                            disabled={isLoading}
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
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              {...field}
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              {...field}
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              disabled={isLoading}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}