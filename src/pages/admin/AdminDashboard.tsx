import { useEffect, useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  ShoppingCart, TrendingUp, Package, Clock, ArrowRight,
  Users, RefreshCw, Zap,
} from "lucide-react";

const ADMIN_KEY = "Besimple90@@";

const STATUS_CFG: Record<string, { label: string; dot: string; bg: string }> = {
  confirmed:  { label: "Confirmed",  dot: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  processing: { label: "Processing", dot: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  shipped:    { label: "Shipped",    dot: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  delivered:  { label: "Delivered",  dot: "#34d399", bg: "rgba(52,211,153,0.1)" },
  cancelled:  { label: "Cancelled",  dot: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

interface Order { id: number; customerName: string; totalAmount: number; status: string; createdAt: string; }
interface Lead  { id: number; name: string; createdAt: string; }
interface Product { id: number; }

// Simple 7-bar sparkline chart component
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="flex items-end gap-1 h-16">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-sm transition-all duration-500"
            style={{ height: `${(v / max) * 52}px`, background: `linear-gradient(180deg, ${color}, ${color}66)`, minHeight: "4px", opacity: 0.85 + (i === values.length - 1 ? 0.15 : 0) }} />
          <span className="text-[8px] font-bold text-slate-700">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [o, l, p] = await Promise.all([
        fetch("/api/admin/orders",   { headers: { "X-Admin-Key": ADMIN_KEY } }).then(r => r.json()),
        fetch("/api/admin/leads",    { headers: { "X-Admin-Key": ADMIN_KEY } }).then(r => r.json()),
        fetch("/api/admin/products", { headers: { "X-Admin-Key": ADMIN_KEY } }).then(r => r.json()),
      ]);
      setOrders(Array.isArray(o) ? o : []);
      setLeads(Array.isArray(l) ? l : []);
      setProducts(Array.isArray(p) ? p : []);
      setLastRefresh(new Date());
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const pending      = orders.filter(o => ["confirmed","processing"].includes(o.status)).length;
  const recent       = [...orders].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  // Mock sparkline data (last 7 days revenue trend)
  const sparkData = [18900, 24500, 19800, 35000, 28700, 41200, totalRevenue > 0 ? totalRevenue * 0.12 : 32000];

  const KPI_CARDS = [
    {
      label: "Total Revenue", value: `৳${totalRevenue.toLocaleString("en-IN")}`, sub: "All-time net",
      icon: TrendingUp, gradient: "linear-gradient(135deg, #ff1744 0%, #ff4500 100%)",
      glow: "rgba(255,23,68,0.3)", iconBg: "rgba(255,255,255,0.2)",
    },
    {
      label: "Total Orders", value: orders.length.toString(), sub: `${pending} pending`,
      icon: ShoppingCart, gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      glow: "rgba(59,130,246,0.3)", iconBg: "rgba(255,255,255,0.2)",
    },
    {
      label: "Leads & COD", value: leads.length.toString(), sub: "Inbound today",
      icon: Users, gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      glow: "rgba(245,158,11,0.3)", iconBg: "rgba(255,255,255,0.2)",
    },
    {
      label: "Products", value: products.length.toString(), sub: "Active listings",
      icon: Package, gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      glow: "rgba(139,92,246,0.3)", iconBg: "rgba(255,255,255,0.2)",
    },
    {
      label: "Pending Action", value: pending.toString(), sub: "Needs attention",
      icon: Clock, gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      glow: "rgba(16,185,129,0.3)", iconBg: "rgba(255,255,255,0.2)",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-8" style={{ minHeight: "100%" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-3xl uppercase tracking-tight text-white">Dashboard</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">
              Last updated {lastRefresh.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button onClick={fetchAll} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            style={{ background: "rgba(255,23,68,0.08)", border: "1px solid rgba(255,23,68,0.2)", color: "#ff1744" }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Pending Alert */}
        {pending > 0 && (
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-sm font-bold text-amber-300">
              {pending} order{pending !== 1 ? "s" : ""} need{pending === 1 ? "s" : ""} attention —{" "}
              <Link href="/admin/orders" className="underline underline-offset-2 hover:text-white transition-colors">Review now</Link>
            </p>
          </div>
        )}

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {KPI_CARDS.map(({ label, value, sub, icon: Icon, gradient, glow, iconBg }) => (
              <div key={label} className="relative overflow-hidden rounded-2xl p-5 group"
                style={{ background: gradient, boxShadow: `0 8px 32px ${glow}` }}>
                {/* Bubble rings */}
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20" style={{ background: iconBg }} />
                <div className="absolute -right-2 -top-2 w-14 h-14 rounded-full opacity-15" style={{ background: iconBg }} />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: iconBg }}>
                  <Icon className="w-4.5 h-4.5 text-white" />
                </div>
                <p className="text-white font-black text-2xl leading-none">{value}</p>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-1">{label}</p>
                <p className="text-white/50 text-[9px] font-bold uppercase tracking-widest mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Revenue Chart + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-1 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,23,68,0.12)" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">7-Day Revenue</p>
                <p className="font-black text-xl text-white">৳{totalRevenue.toLocaleString("en-IN")}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,23,68,0.12)", border: "1px solid rgba(255,23,68,0.2)" }}>
                <TrendingUp className="w-4 h-4" style={{ color: "#ff1744" }} />
              </div>
            </div>
            <Sparkline values={sparkData} color="#ff1744" />
            <div className="mt-4 pt-4 flex justify-between" style={{ borderTop: "1px solid rgba(255,23,68,0.08)" }}>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Avg/Day</p>
                <p className="text-sm font-black text-white mt-0.5">৳{Math.round(totalRevenue / 7).toLocaleString("en-IN")}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Orders</p>
                <p className="text-sm font-black text-white mt-0.5">{orders.length}</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,23,68,0.12)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,23,68,0.08)" }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white">Recent Orders</p>
              <Link href="/admin/orders" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors hover:text-white" style={{ color: "#ff1744" }}>
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-8 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <ShoppingCart className="w-8 h-8 mb-3 opacity-40" />
                <p className="text-xs font-bold uppercase tracking-widest">No orders yet</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,23,68,0.06)" }}>
                {recent.map(order => {
                  const cfg = STATUS_CFG[order.status] || { label: order.status, dot: "#64748b", bg: "rgba(100,116,139,0.1)" };
                  return (
                    <div key={order.id} className="flex items-center px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mr-3"
                        style={{ background: "rgba(255,23,68,0.08)", border: "1px solid rgba(255,23,68,0.15)" }}>
                        <Zap className="w-3.5 h-3.5" style={{ color: "#ff1744" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-wide text-white truncate">{order.customerName}</p>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">#{order.id} · {new Date(order.createdAt).toLocaleDateString("en-BD")}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <span className="text-xs font-black text-white">৳{(Number(order.totalAmount) || 0).toLocaleString("en-IN")}</span>
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                          style={{ background: cfg.bg, color: cfg.dot, border: `1px solid ${cfg.dot}30` }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/admin/orders",   label: "Manage Orders",   sub: `${orders.length} total`,    icon: ShoppingCart, color: "#3b82f6" },
            { href: "/admin/leads",    label: "View Leads",      sub: `${leads.length} total`,     icon: Users,        color: "#f59e0b" },
            { href: "/admin/products", label: "Edit Products",   sub: `${products.length} active`, icon: Package,      color: "#8b5cf6" },
            { href: "/admin/settings", label: "Integrations",    sub: "API Keys",                  icon: Zap,          color: "#ff1744" },
          ].map(({ href, label, sub, icon: Icon, color }) => (
            <Link key={href} href={href}>
              <div className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,23,68,0.08)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white truncate">{label}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">{sub}</p>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-700 group-hover:text-slate-400 transition-colors ml-auto flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
