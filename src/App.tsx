import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import SuperAdminRoute from "@/components/SuperAdminRoute";

// Import Index directly - it's the entry point and should load immediately
import Index from "./pages/Index";

// Lazy load other pages for better code splitting
const NotFound = lazy(() => import("./pages/NotFound"));
const Products = lazy(() => import("./pages/Products"));
const CategoryView = lazy(() => import("./pages/CategoryView"));
const Account = lazy(() => import("./pages/Account"));
const Profile = lazy(() => import("./pages/Profile"));
const Orders = lazy(() => import("./pages/Orders"));
const Settings = lazy(() => import("./pages/Settings"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminCoupons = lazy(() => import("./pages/AdminCoupons"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminSecurity = lazy(() => import("./pages/AdminSecurity"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Search = lazy(() => import("./pages/Search"));
const InstallApp = lazy(() => import("./pages/InstallApp"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Simple loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<Search />} />
                <Route path="/install" element={<InstallApp />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/category/:slug" element={<CategoryView />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:category" element={<Products />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
                <Route path="/account" element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <SuperAdminRoute>
                    <Admin />
                  </SuperAdminRoute>
                } />
                <Route path="/admin/products" element={
                  <SuperAdminRoute>
                    <AdminProducts />
                  </SuperAdminRoute>
                } />
                <Route path="/admin/categories" element={
                  <SuperAdminRoute>
                    <AdminCategories />
                  </SuperAdminRoute>
                } />
                <Route path="/admin/users" element={
                  <SuperAdminRoute>
                    <AdminUsers />
                  </SuperAdminRoute>
                } />
                <Route path="/admin/coupons" element={
                  <SuperAdminRoute>
                    <AdminCoupons />
                  </SuperAdminRoute>
                } />
                <Route path="/admin/analytics" element={
                  <SuperAdminRoute>
                    <AdminAnalytics />
                  </SuperAdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <SuperAdminRoute>
                    <AdminOrders />
                  </SuperAdminRoute>
                } />
                <Route path="/admin/security" element={
                  <SuperAdminRoute>
                    <AdminSecurity />
                  </SuperAdminRoute>
                } />
                <Route path="/admin/settings" element={
                  <SuperAdminRoute>
                    <AdminSettings />
                  </SuperAdminRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                {/* Legacy category routes for backward compatibility */}
                <Route path="/clothing" element={<Products />} />
                <Route path="/accessories" element={<Products />} />
                <Route path="/groceries" element={<Products />} />
                <Route path="/household" element={<Products />} />
                <Route path="/specials" element={<Products />} />
                {/* Category routes for all active categories */}
                <Route path="/formal-wear" element={<Products />} />
                <Route path="/bags-luggage" element={<Products />} />
                <Route path="/beauty-personal-care" element={<Products />} />
                <Route path="/beverages" element={<Products />} />
                <Route path="/jewelries" element={<Products />} />
                <Route path="/fashion-clothing" element={<Products />} />
                <Route path="/food-beverages" element={<Products />} />
                <Route path="/make-up-kits" element={<Products />} />
                <Route path="/home-living" element={<Products />} />
                <Route path="/sports-fitness" element={<Products />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
