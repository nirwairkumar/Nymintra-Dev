import Link from "next/link";
import { redirect } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // In a real app we'd verify the user is logged in AND has an "admin" role
    // using Next.js middleware or checking cookies here. For MVP, we'll
    // assume they are allowed if they reach here or handle client-side.

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b">
                    <span className="font-serif text-2xl font-bold text-primary">Nymintra Admin</span>
                </div>
                <nav className="flex-1 py-4 px-2 space-y-1">
                    <Link href="/admin" className="block px-4 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">
                        Dashboard
                    </Link>
                    <Link href="/admin/orders" className="block px-4 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">
                        Orders
                    </Link>
                    <Link href="/admin/designs" className="block px-4 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">
                        Designs Library
                    </Link>
                    <Link href="/admin/settings" className="block px-4 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">
                        Settings
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <header className="h-16 bg-card border-b flex items-center justify-between px-4 md:hidden">
                    <span className="font-serif text-xl font-bold text-primary">Admin</span>
                    {/* Hamburger menu would go here */}
                </header>

                <div className="flex-1 p-8 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
