"use client";

import { Link, useNavigate, useLocation } from 'react-router-dom';
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
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
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
        navigate('/');
    };

    if (!mounted) {
        // Return a placeholder that mimics the height and structure before hydration
        return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16"></header>;
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
            <div className="container mx-auto px-4 h-16 max-w-7xl flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                    <span className="font-serif text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Nymintra</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                    <Link to="/" className={`transition-colors hover:text-primary ${pathname === '/' ? 'text-primary font-semibold' : 'text-foreground/80'}`}>Home</Link>
                    <Link to="/cards" className={`transition-colors hover:text-primary ${pathname.startsWith('/cards') ? 'text-primary font-semibold' : 'text-foreground/80'}`}>Cards</Link>
                    <Link to="/about" className={`transition-colors hover:text-primary ${pathname === '/about' ? 'text-primary font-semibold' : 'text-foreground/80'}`}>About</Link>
                </nav>

                <div className="flex items-center space-x-5">
                    <Link to="/cart" className="relative p-2 rounded-full text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors">
                        <svg xmlns="http://www.w3.org/0000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                    </Link>

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="outline-none">
                                <Avatar className="h-10 w-10 border-2 border-primary/20 transition-all hover:border-primary/50 shadow-sm">
                                    <AvatarImage src={user.avatar_url || ""} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-serif font-bold text-lg">
                                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2 border-border/50 shadow-xl bg-background/95 backdrop-blur-sm rounded-xl">
                                <div className="px-3 py-2 font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-semibold leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground mt-1">{user.phone}</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer font-medium hover:bg-primary/5 rounded-md mx-1" onClick={() => navigate('/profile')}>
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer font-medium hover:bg-primary/5 rounded-md mx-1" onClick={() => navigate('/orders')}>
                                    My Orders
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer font-medium hover:bg-primary/5 rounded-md mx-1">
                                    Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer font-medium text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md mx-1 mb-1">
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link to="/login" className="text-sm font-semibold bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
