import { useEffect, useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ShoppingBag, TrendingUp, Package, Clock, ArrowRight, Phone } from "lucide-react";

const ADMIN_KEY = "besimple2024";

const STATUS_CFG: Record<string, { label: string; dot: string; bg: string }> = {
  confirmed:  { label: "Confirmed",  dot: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  processing: { label: "Processing", dot: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  shipped:    { label: "Shipped",    dot: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  delivered:  { label: "Delivered",  dot: "#34d399", bg: "rgba(52,211,153,0.12)" },
  cancelled:  { label: "Cancelled",  dot: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

interface Stats {
  totalOrders: number; totalRevenue: number; pendingOrders: number;
  processingOrders: number; totalProducts: number; newLeads: number;
  recentOrders: Order[];
}
interface Order {
  id: number; customerName: string; email: string; city: string;
  total: number; status: string; items: unknown[]; createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { headers: { "x-admin-key": ADMIN_KEY } })
      .then(r => r.json()).then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const CARDS = stats ? [
    {
      label: "Total Revenue", value: `৳${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp, gradient: "linear-gradient(135deg, #c9a227 0%, #8a6f2b 100%)",
      glow: "rgba(201,162,39,0.3)", text: "#c9a227", bg: "rgba(201,162,39,0.08)",
    },
    {
      label: "Total Orders", value: stats.totalOrders,
      icon: ShoppingBag, gradient: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
      glow: "rgba(96,165,250,0.3)", text: "#60a5fa", bg: "rgba(96,165,250,0.08)",
    },
    {
      label: "New Leads", value: stats.newLeads,
      icon: Phone, gradient: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
      glow: "rgba(251,146,60,0.3)", text: "#fb923c", bg: "rgba(251,146,60,0.08)",
    },
    {
      label: "Products", value: stats.totalProducts,
      icon: Package, gradient: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
      glow: "rgba(167,139,250,0.3)", text: "#a78bfa", bg: "rgba(167,139,250,0.08)",
    },
    {
      label: "Pending Orders", value: stats.pendingOrders,
      icon: Clock, gradient: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
      glow: "rgba(52,211,153,0.3)", text: "#34d399", bg: "rgba(52,211,153,0.08)",
    },
  ] : [];

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
              {new Date().toLocaleDateString("en-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-[11px] font-black uppercase tracking-widest">Store Live</span>
          </div>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CARDS.map(({ label, value, icon: Icon, gradient, glow, text, bg }) => (
              <div key={label} className="relative rounded-2xl p-5 overflow-hidden transition-transform hover:-translate-y-0.5"
                style={{ background: bg, border: `1px solid ${glow.replace("0.3", "0.2")}`, boxShadow: `0 4px 24px ${glow.replace("0.3", "0.1")}` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: gradient }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-black leading-none mb-1.5" style={{ color: text }}>{value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent Orders */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <h2 className="font-black text-white text-base tracking-tight">Recent Orders</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Last 10 transactions</p>
            </div>
            <Link href="/admin/orders">
              <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest transition-colors cursor-pointer" style={{ color: "#c9a227" }}>
                View All <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
            </div>
          ) : !stats?.recentOrders?.length ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.1)" }} />
              <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Order", "Customer", "City", "Items", "Total", "Status", "Date"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order, i) => {
                    const sc = STATUS_CFG[order.status];
                    return (
                      <tr key={order.id} className="transition-colors" style={{ borderBottom: i < stats.recentOrders.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="px-5 py-4">
                          <Link href="/admin/orders">
                            <span className="font-black text-sm cursor-pointer hover:opacity-80" style={{ color: "#c9a227" }}>#{order.id}</span>
                          </Link>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-white text-sm">{order.customerName}</p>
                          <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{order.email}</p>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold" style={{ color: "rgba(255,255,255,0.45)" }}>{order.city}</td>
                        <td className="px-5 py-4 text-sm font-bold" style={{ color: "rgba(255,255,255,0.45)" }}>{(order.items as unknown[]).length}</td>
                        <td className="px-5 py-4 font-black text-sm" style={{ color: "#c9a227" }}>৳{order.total.toFixed(0)}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                            style={{ background: sc?.bg ?? "rgba(255,255,255,0.08)", color: sc?.dot ?? "#fff" }}>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc?.dot ?? "#fff" }} />
                            {sc?.label ?? order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[11px] font-bold whitespace-nowrap" style={{ color: "rgba(255,255,255,0.25)" }}>
                          {new Date(order.createdAt).toLocaleDateString("en-BD", { day: "2-digit", month: "short" })},{" "}
                          {new Date(order.createdAt).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
