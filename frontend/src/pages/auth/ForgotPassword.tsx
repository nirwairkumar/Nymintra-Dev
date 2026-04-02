"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from 'react-router-dom';
import { authService } from "@/services/auth.service";

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

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            await authService.forgotPassword(values.email);
            setSuccess("If an account exists for this email, you will receive a password reset link shortly.");
        } catch (err: any) {
            setError(
                err.response?.data?.detail || "Failed to process request. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 py-20 relative">
            {/* Background Decorative Pattern */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl translate-x-[20%] translate-y-[-20%]"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl translate-x-[-30%] translate-y-[30%]"></div>
            </div>

            <div className="w-full max-w-md z-10 bg-card p-8 rounded-2xl shadow-xl border border-primary/10">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <span className="font-serif text-3xl font-bold text-primary">Nymintra</span>
                    </Link>
                    <h1 className="mt-4 text-2xl font-serif font-semibold text-foreground">Forgot Password?</h1>
                    <p className="text-muted-foreground mt-2 font-sans text-sm">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm text-center font-medium shadow-sm">
                        <div className="flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            {success}
                        </div>
                    </div>
                )}

                {!success && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="e.g. rahul@example.com" {...field} className="h-12 bg-background" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full h-12 text-md font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-md"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Reset Password"}
                            </Button>
                        </form>
                    </Form>
                )}

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
