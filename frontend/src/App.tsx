import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/layout/Navbar';

import { CartProvider } from '@/context/CartContext';

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const Verify = lazy(() => import('@/pages/auth/Verify'));
const Cards = lazy(() => import('@/pages/Cards'));
const CardDetail = lazy(() => import('@/pages/cards/slug'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Cart = lazy(() => import('@/pages/Cart'));
const Orders = lazy(() => import('@/pages/Orders'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminDesigns = lazy(() => import('@/pages/admin/Designs'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('@/pages/admin/orders/id'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));
const AdminUploadCard = lazy(() => import('@/pages/admin/designs/Upload'));
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'));
const AdminCustomers = lazy(() => import('@/pages/admin/Customers'));
const AdminFormBuilder = lazy(() => import('@/pages/admin/FormBuilder'));

// Layout wrapper for the main site
const AppLayout = () => {
  const { t } = useTranslation();
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
              {t('footer.tagline')}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-6 font-serif text-lg tracking-wide uppercase text-secondary">{t('footer.categories')}</h4>
            <ul className="space-y-4 text-base text-muted-foreground">
              <li><Link to="/cards" className="hover:text-primary transition-colors">{t('footer.weddingCards')}</Link></li>
              <li><Link to="/cards" className="hover:text-primary transition-colors">{t('footer.engagementCards')}</Link></li>
              <li><Link to="/cards" className="hover:text-primary transition-colors">{t('footer.birthdayInvitations')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-6 font-serif text-lg tracking-wide uppercase text-secondary">{t('footer.support')}</h4>
            <ul className="space-y-4 text-base text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary transition-colors">{t('footer.faq')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t('footer.contactUs')}</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">{t('footer.shippingPolicy')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-6 font-serif text-lg tracking-wide uppercase text-secondary">{t('footer.connect')}</h4>
            <p className="text-base text-muted-foreground mb-6">{t('footer.followUs')}</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav Spacer */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
};

function App() {
  const { t } = useTranslation();
  return (
    <BrowserRouter>
      <CartProvider>
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

            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<Orders />} />

            {/* Admin Routes with Unified Layout */}
            <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Admin />} />
                <Route path="designs" element={<AdminDesigns />} />
                <Route path="designs/upload" element={<AdminUploadCard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:id" element={<AdminOrderDetail />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="forms" element={<AdminFormBuilder />} />
                <Route path="settings" element={<AdminSettings />} />
            </Route>

          <Route path="*" element={<div className="py-20 text-center font-serif text-3xl">{t('common.pageNotFound')}</div>} />
        </Route>
      </Routes>
    </CartProvider>
  </BrowserRouter>
  );
}

export default App;
