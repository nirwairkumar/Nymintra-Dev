"use client";

import { useState } from "react";
import { useNavigate } from 'react-router-dom';
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

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
    const router = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            await authService.login(values);
            setSuccess("Successfully logged in! Redirecting...");
            setTimeout(() => {
                router("/"); // Redirect to home on success
            }, 1500);
        } catch (err: any) {
            setError(
                err.response?.data?.detail || "Failed to login. Please check your credentials."
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
                    <h1 className="mt-4 text-2xl font-serif font-semibold text-foreground">Welcome Back</h1>
                    <p className="text-muted-foreground mt-2 font-sans text-sm">
                        Sign in to access your saved designs and orders
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

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="e.g. rahul@example.com" {...field} className="h-12 bg-background" suppressHydrationWarning />
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
                                    <FormLabel className="flex justify-between items-center text-foreground">
                                        <span>Password</span>
                                        <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter password" {...field} className="h-12 bg-background" suppressHydrationWarning />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full h-12 text-md font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-md"
                            disabled={loading}
                            suppressHydrationWarning
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </Form>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-primary font-semibold hover:underline">
                        Create one
                    </Link>
                </div>
            </div>
        </div>
    );
}
