// app/forgot-password/page.tsx
"use client"; // This directive is crucial for using hooks like useRouter

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });
      
      // Even if the request fails (e.g., email not found), we show a generic success message
      // This is a security measure to prevent email enumeration.
      toast.success("If an account with that email exists, a reset link has been sent.");
      form.reset();

    } catch (error) {
      console.error("Forgot Password error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    }
  }

  return (
    <>
      <Toaster richColors />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Forgot Your Password?</h2>
            <p className="text-gray-600 mt-2">
              No problem. Enter your email address below, and we'll send you a
              link to reset your password.
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        {...field}
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Sending..."
                  : "Send Reset Link"}
              </Button>
            </form>
          </Form>
           <div className="text-center mt-4">
              <Button variant="link" onClick={() => router.push('/login')}>
                Back to Login
              </Button>
            </div>
        </div>
      </div>
    </>
  );
}

