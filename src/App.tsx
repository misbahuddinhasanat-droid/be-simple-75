import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { useEffect } from "react";
import { useGTM } from "@/hooks/useGTM";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Customize from "@/pages/Customize";
import DesignTemplates from "@/pages/DesignTemplates";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import NotFound from "@/pages/not-found";
import Contact from "@/pages/Contact";
import ReturnPolicy from "@/pages/ReturnPolicy";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Wishlist from "@/pages/Wishlist";
import TrackOrder from "@/pages/TrackOrder";
import FAQ from "@/pages/FAQ";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminStoreInfo from "@/pages/admin/AdminStoreInfo";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminCategories from "@/pages/admin/AdminCategories";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function GTMLoader() {
  useGTM();
  return null;
}

function Router() {
  return (
    <Switch>
      {/* ── Admin routes (no public layout) ── */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/orders">
        <AdminGuard><AdminOrders /></AdminGuard>
      </Route>
      <Route path="/admin/products">
        <AdminGuard><AdminProducts /></AdminGuard>
      </Route>
      <Route path="/admin/categories">
        <AdminGuard><AdminCategories /></AdminGuard>
      </Route>
      <Route path="/admin/inventory">
        <AdminGuard><AdminInventory /></AdminGuard>
      </Route>
      <Route path="/admin/leads">
        <AdminGuard><AdminLeads /></AdminGuard>
      </Route>
      <Route path="/admin/settings">
        <AdminGuard><AdminSettings /></AdminGuard>
      </Route>
      <Route path="/admin/categories">
        <AdminGuard><AdminCategories /></AdminGuard>
      </Route>
      <Route path="/admin/store-info">
        <AdminGuard><AdminStoreInfo /></AdminGuard>
      </Route>
      <Route path="/admin/dashboard">
        <AdminGuard><AdminDashboard /></AdminGuard>
      </Route>
      <Route path="/admin">
        <AdminGuard><AdminDashboard /></AdminGuard>
      </Route>

      {/* ── Public routes (with navbar/footer) ── */}
      <Route>
        <Layout>
          <ScrollToTop />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={Products} />
            <Route path="/product/:id" component={ProductDetail} />
            <Route path="/customize" component={Customize} />
            <Route path="/design-templates" component={DesignTemplates} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/order-confirmation/:id" component={OrderConfirmation} />
            <Route path="/contact" component={Contact} />
            <Route path="/returns" component={ReturnPolicy} />
            <Route path="/privacy" component={PrivacyPolicy} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/wishlist" component={Wishlist} />
            <Route path="/track-order" component={TrackOrder} />
            <Route path="/faq" component={FAQ} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base="">
          <GTMLoader />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
