import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";

export default function VerifyPage() {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verifyToken = async () => {
            // Supabase redirects with hash fragment: #access_token=...&refresh_token=...
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get("access_token");
            const type = hashParams.get("type");

            if (accessToken) {
                // Save the token so authService can use it
                Cookies.set("access_token", accessToken, { expires: 7, path: "/" });

                try {
                    // Fetch the user profile from our backend to cache it and ensure they are fully set up
                    const user = await authService.getCurrentUser();
                    if (user) {
                        localStorage.setItem("user", JSON.stringify(user));
                        setStatus("success");
                        setMessage(type === "recovery" ? "Password reset successful!" : "Your account has been successfully verified!");
                    } else {
                        throw new Error("Could not fetch user profile");
                    }
                } catch (error) {
                    console.error("Failed to verify user profile after token retrieval", error);
                    setStatus("error");
                    setMessage("We successfully verified your email, but had trouble loading your profile. Please try logging in.");
                }
            } else {
                // If there's no hash with token, maybe they already verified or link is invalid. Check if already logged in.
                const existingToken = Cookies.get("access_token");
                if (existingToken) {
                    setStatus("success");
                    setMessage("You are already verified and logged in.");
                } else {
                    setStatus("error");
                    setMessage("Invalid or expired verification link. If you have already verified your email, please log in.");
                }
            }
            
            // Clear the hash from the URL for cleaner UI
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
        };

        verifyToken();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 py-20 relative">
            <div className="w-full max-w-md z-10 bg-card p-8 rounded-2xl shadow-xl border border-primary/10 text-center">
                <Link to="/" className="inline-block mb-8">
                    <span className="font-serif text-3xl font-bold text-primary">Nymintra</span>
                </Link>

                {status === "loading" && (
                    <div className="py-8">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-xl font-serif font-semibold text-foreground">Verifying Your Account</h2>
                        <p className="text-muted-foreground mt-2">Please wait a moment...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Verification Success!</h2>
                        <p className="text-muted-foreground mb-8">
                            {message}
                        </p>
                        <button 
                            onClick={() => window.location.href = "/"}
                            className="inline-flex h-12 items-center justify-center rounded-md bg-primary text-primary-foreground px-8 font-medium hover:bg-primary/90 transition-all shadow-md w-full"
                        >
                            Continue to Website
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <div className="py-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                        <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Verification Failed</h2>
                        <p className="text-muted-foreground mb-8 text-sm">
                            {message}
                        </p>
                        <Link to="/login" className="inline-flex h-12 items-center justify-center rounded-md bg-secondary text-secondary-foreground px-8 font-medium hover:bg-secondary/90 transition-all shadow-md w-full">
                            Go to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
