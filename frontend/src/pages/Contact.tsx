"use client";

import { useState } from "react";
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    contact: z.string().min(10, "Please enter a valid email or phone number"),
    type: z.string().optional(),
    message: z.string().min(5, "Message must be at least 5 characters"),
});

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
};

export default function ContactPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const form = useForm<z.infer<typeof contactSchema>>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "",
            contact: "",
            type: "",
            message: "",
        },
    });

    async function onSubmit(values: z.infer<typeof contactSchema>) {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log("Contact Inquiry:", values);
            setLoading(false);
            setSuccess(true);
            form.reset();
        }, 1500);
    }

    return (
        <div className="flex flex-col min-h-screen bg-background pb-20">
            {/* Hero Header */}
            <section className="bg-primary py-16 md:py-24 text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-serif font-bold mb-4"
                    >
                        {t('contact.title')}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-primary-foreground/80 md:text-lg"
                    >
                        {t('contact.subtitle')}
                    </motion.p>
                </div>
            </section>

            <div className="container mx-auto px-4 -mt-12 md:-mt-20 relative z-20">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } }
                        }}
                        className="lg:col-span-1 space-y-6"
                    >
                        {/* WhatsApp & Phone */}
                        <motion.div variants={fadeInUp} className="bg-card p-8 rounded-2xl shadow-xl border border-primary/5 group hover:border-primary/20 transition-all">
                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            </div>
                            <h3 className="font-serif font-bold text-xl mb-2">{t('contact.phone')}</h3>
                            <p className="text-muted-foreground mb-4">+91 6299857081</p>
                            <a 
                                href="https://wa.me/916299857081" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-green-600 font-semibold hover:underline decoration-2 underline-offset-4"
                            >
                                Chat on WhatsApp 
                                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </a>
                        </motion.div>

                        {/* Email */}
                        <motion.div variants={fadeInUp} className="bg-card p-8 rounded-2xl shadow-xl border border-primary/5 group hover:border-primary/20 transition-all">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                            </div>
                            <h3 className="font-serif font-bold text-xl mb-2">{t('contact.email')}</h3>
                            <p className="text-muted-foreground mb-4">support@nymintra.com</p>
                        </motion.div>

                        {/* Address */}
                        <motion.div variants={fadeInUp} className="bg-card p-8 rounded-2xl shadow-xl border border-primary/5 group hover:border-primary/20 transition-all">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            </div>
                            <h3 className="font-serif font-bold text-xl mb-2">{t('contact.address')}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('contact.addressText')}
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Inquiry Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 bg-card p-10 rounded-3xl shadow-2xl border border-primary/10"
                    >
                        <h2 className="text-3xl font-serif font-bold mb-8 text-foreground">{t('contact.sendMessage')}</h2>
                        
                        {success ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50 border border-green-200 p-8 rounded-xl text-center"
                            >
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-green-800 mb-2">{t('contact.success')}</h3>
                                <Button onClick={() => setSuccess(false)} variant="outline" className="mt-4 border-green-200 text-green-700 hover:bg-green-100">
                                    Send another message
                                </Button>
                            </motion.div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('contact.fullName')}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Rajesh Kumar" {...field} className="h-12" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="contact"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('contact.emailOrPhone')}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="rajesh@example.com" {...field} className="h-12" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('contact.eventType')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Wedding, Birthday" {...field} className="h-12" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('contact.message')}</FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        placeholder="How can we help you?" 
                                                        className="min-h-[150px] resize-none pt-4" 
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button 
                                        type="submit" 
                                        className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30"
                                        disabled={loading}
                                    >
                                        {loading ? t('contact.submitting') : t('contact.submit')}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
