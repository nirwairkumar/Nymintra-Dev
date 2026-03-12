"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import Cookies from 'js-cookie';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = Cookies.get('access_token');
        if (token) {
            const cachedUser = localStorage.getItem('user');
            if (cachedUser) {
                try {
                    setUser(JSON.parse(cachedUser));
                } catch {
                    // Ignore JSON errors
                }
            }

            // Still verify in background to ensure sync and token validity
            authService.getCurrentUser()
                .then(data => {
                    setUser(data);
                    localStorage.setItem('user', JSON.stringify(data));
                })
                .catch(() => {
                    setUser(null);
                    localStorage.removeItem('user');
                    Cookies.remove('access_token', { path: '/' }); // Ensure cookie is also gone
                });
        } else {
            setUser(null);
            localStorage.removeItem('user');
        }
    }, [pathname]); // Re-run when navigation happens

    const handleLogout = () => {
        authService.logout();
        setUser(null);
    };

    if (!mounted) {
        // Return a placeholder that mimics the height and structure before hydration
        return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16"></header>;
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 max-w-7xl flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="font-serif text-2xl font-bold text-primary">Nymintra</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                    <Link href="/" className="transition-colors hover:text-primary">Home</Link>
                    <Link href="/cards" className="transition-colors hover:text-primary">Cards</Link>
                    <Link href="/about" className="transition-colors hover:text-primary">About</Link>
                </nav>

                <div className="flex items-center space-x-4">
                    <Link href="/cart" className="p-2 border rounded-full bg-secondary/10 text-primary hover:bg-secondary/20 transition-colors">
                        <svg xmlns="http://www.w3.org/0000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                    </Link>

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="outline-none">
                                <Avatar className="h-9 w-9 border border-primary/10 transition-opacity hover:opacity-80">
                                    <AvatarImage src={user.avatar_url || ""} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-1">
                                <div className="px-2 py-1.5 font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.phone}</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/profile')}>
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/orders')}>
                                    My Orders
                                </DropdownMenuItem>
                                {/* We'll implement reset password modal later */}
                                <DropdownMenuItem className="cursor-pointer">
                                    Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors pr-2">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
