import type { Metadata } from 'next';
import { Inter, Playfair_Display, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import './globals.css';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '700'],
  subsets: ['devanagari'],
  variable: '--font-hindi'
});

export const metadata: Metadata = {
  title: 'Nymintra | Design Your Dream Invitation',
  description: 'Online platform for ordering beautifully customized printed invitation cards for Indian events.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${notoSansDevanagari.variable} antialiased min-h-screen flex flex-col font-sans`}>
        {/* Top Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t py-12 bg-background mt-auto">
          <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="font-serif text-2xl font-bold text-primary">Nymintra</span>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Connecting families with beautiful, culturally rich invitation cards. Designed with love, printed with precision.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 font-serif">Categories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/cards/wedding" className="hover:text-primary">Wedding Cards</Link></li>
                <li><Link href="/cards/engagement" className="hover:text-primary">Engagement Cards</Link></li>
                <li><Link href="/cards/birthday" className="hover:text-primary">Birthday Invitations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 font-serif">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
                <li><Link href="/shipping" className="hover:text-primary">Shipping Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 font-serif">Connect</h4>
              <p className="text-sm text-muted-foreground mb-4">Follow us on social media for design inspiration.</p>
              {/* Social links */}
            </div>
          </div>
        </footer>

        {/* Mobile Bottom Nav Spacer */}
        <div className="h-16 md:hidden"></div>
        {/* Mobile Nav would go here as fixed bottom bar */}
      </body>
    </html>
  );
}
