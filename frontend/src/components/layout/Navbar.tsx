"use client";

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useCart } from '@/context/CartContext';

export function Navbar() {
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMobileMenuOpen(false); // Close menu on route change
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

                {/* Desktop Nav - Hidden in Admin Dashboard */}
                {!pathname.startsWith('/admin') && (
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                        <Link to="/" className={`transition-colors hover:text-primary ${pathname === '/' ? 'text-primary font-semibold' : 'text-foreground/80'}`}>Home</Link>
                        <Link to="/cards" className={`transition-colors hover:text-primary ${pathname.startsWith('/cards') ? 'text-primary font-semibold' : 'text-foreground/80'}`}>Cards</Link>
                        <Link to="/about" className={`transition-colors hover:text-primary ${pathname === '/about' ? 'text-primary font-semibold' : 'text-foreground/80'}`}>About</Link>
                    </nav>
                )}

                <div className="flex items-center space-x-3 md:space-x-5">
                    {/* Language Switcher - only on customer pages */}
                    {!pathname.startsWith('/admin') && (
                        <LanguageSwitcher />
                    )}

                    {/* Cart Icon - Desktop */}
                    {!pathname.startsWith('/admin') && (
                        <Link to="/cart" className="hidden md:flex relative p-2 rounded-full text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm animate-in zoom-in">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* User Area - Desktop */}
                    <div className="hidden md:block">
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
                                    
                                    {user.role === 'admin' && (
                                        <>
                                            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">DASHBOARDS</div>
                                            <DropdownMenuItem className="cursor-pointer font-semibold text-primary hover:bg-primary/5 rounded-md mx-1" onClick={() => navigate('/admin')}>
                                                Admin Dashboard
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer font-semibold text-secondary hover:bg-secondary/5 rounded-md mx-1" onClick={() => navigate('/')}>
                                                User Dashboard
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}

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

                    {/* Mobile Hamburger Menu Toggle */}
                    {!pathname.startsWith('/admin') && (
                        <button 
                            className="md:hidden p-2 -mr-2 text-foreground/80 hover:text-primary transition-colors focus:outline-none"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle Menu"
                        >
                            {isMobileMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && !pathname.startsWith('/admin') && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-b border-border/50 bg-background/95 backdrop-blur-md overflow-hidden"
                    >
                        <nav className="flex flex-col py-4 px-6 space-y-4 shadow-inner">
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`text-lg font-medium transition-colors ${pathname === '/' ? 'text-primary font-bold' : 'text-foreground/80'}`}>Home</Link>
                            <Link to="/cards" onClick={() => setIsMobileMenuOpen(false)} className={`text-lg font-medium transition-colors ${pathname.startsWith('/cards') ? 'text-primary font-bold' : 'text-foreground/80'}`}>Cards</Link>
                            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className={`text-lg font-medium transition-colors ${pathname === '/about' ? 'text-primary font-bold' : 'text-foreground/80'}`}>About</Link>
                            
                            <div className="h-px bg-border/50 my-2" />
                            
                            <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center text-lg font-medium transition-colors ${pathname === '/cart' ? 'text-primary font-bold' : 'text-foreground/80'}`}>
                                <div className="relative mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[8px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full shadow-sm">
                                            {cartCount}
                                        </span>
                                    )}
                                </div>
                                Cart
                            </Link>
                            
                            {user ? (
                                <div className="mt-4 pt-4 border-t border-border/50 flex flex-col space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-foreground">{user.name}</span>
                                        <span className="text-xs text-muted-foreground mb-2">{user.phone}</span>
                                    </div>
                                    {user.role === 'admin' && (
                                        <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-primary">Admin Dashboard</Link>
                                    )}
                                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground/80">Profile</Link>
                                    <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground/80">My Orders</Link>
                                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-lg font-medium text-destructive text-left mt-2 focus:outline-none">Logout</button>
                                </div>
                            ) : (
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-primary mt-4 pt-4 border-t border-border/50">Login</Link>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
