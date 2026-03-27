import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const Verify = lazy(() => import('@/pages/auth/Verify'));
const Cards = lazy(() => import('@/pages/Cards'));
const CardDetail = lazy(() => import('@/pages/cards/slug'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Orders = lazy(() => import('@/pages/Orders'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminDesigns = lazy(() => import('@/pages/admin/Designs'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));


// Layout wrapper for the main site
const AppLayout = () => {
  return (
    <div className="antialiased min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full mx-auto">
        <Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t py-16 bg-background mt-auto">
        <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <span className="font-serif text-3xl font-bold text-primary">Nymintra</span>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed">
              Connecting families with beautiful, culturally rich invitation cards. Designed with love, printed with precision.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-6 font-serif text-lg tracking-wide uppercase text-secondary">Categories</h4>
            <ul className="space-y-4 text-base text-muted-foreground">
              <li><Link to="/cards" className="hover:text-primary transition-colors">Wedding Cards</Link></li>
              <li><Link to="/cards" className="hover:text-primary transition-colors">Engagement Cards</Link></li>
              <li><Link to="/cards" className="hover:text-primary transition-colors">Birthday Invitations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-6 font-serif text-lg tracking-wide uppercase text-secondary">Support</h4>
            <ul className="space-y-4 text-base text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-6 font-serif text-lg tracking-wide uppercase text-secondary">Connect</h4>
            <p className="text-base text-muted-foreground mb-6">Follow us on social media for design inspiration.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav Spacer */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify" element={<Verify />} />

          <Route path="cards">
            <Route index element={<Cards />} />
            <Route path=":slug" element={<CardDetail />} />
          </Route>

          <Route path="checkout/:id" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<Orders />} />

          {/* Admin Routes */}
          <Route path="admin" element={<Admin />} />
          <Route path="admin/designs" element={<AdminDesigns />} />
          <Route path="admin/orders" element={<AdminOrders />} />
          <Route path="admin/settings" element={<AdminSettings />} />

          <Route path="*" element={<div className="py-20 text-center font-serif text-3xl">Page Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
