import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { useEffect } from "react";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Customize from "@/pages/Customize";
import DesignTemplates from "@/pages/DesignTemplates";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import NotFound from "@/pages/not-found";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminProducts from "@/pages/admin/AdminProducts";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
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
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
