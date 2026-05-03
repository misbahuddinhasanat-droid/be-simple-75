import { useEffect, useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ShoppingBag, TrendingUp, Package, Clock, ChevronRight } from "lucide-react";

const ADMIN_KEY = "besimple2024";

const STATUS_COLORS: Record<string, string> = {
  confirmed:  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  processing: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  shipped:    "bg-purple-500/20 text-purple-300 border-purple-500/30",
  delivered:  "bg-green-500/20 text-green-300 border-green-500/30",
  cancelled:  "bg-red-500/20 text-red-300 border-red-500/30",
};

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  totalProducts: number;
  recentOrders: Order[];
}

interface Order {
  id: number;
  customerName: string;
  email: string;
  city: string;
  total: number;
  status: string;
  items: unknown[];
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { headers: { "x-admin-key": ADMIN_KEY } })
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: "Total Orders",    value: stats.totalOrders,               icon: ShoppingBag, color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20" },
    { label: "Total Revenue",   value: `৳${stats.totalRevenue.toFixed(0)}`, icon: TrendingUp, color: "text-[#b8973a]", bg: "bg-[#b8973a]/10", border: "border-[#b8973a]/20" },
    { label: "Products",        value: stats.totalProducts,              icon: Package,    color: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/20" },
    { label: "New Orders",      value: stats.pendingOrders,              icon: Clock,      color: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/20" },
  ] : [];

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="font-black uppercase tracking-tight text-white text-3xl">Dashboard</h1>
          <p className="text-[#7a8a99] text-xs font-bold uppercase tracking-widest mt-1">
            {new Date().toLocaleDateString("en-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-28 bg-[#0d1b2a] border border-[#1a2840] animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(({ label, value, icon: Icon, color, bg, border }) => (
              <div key={label} className={`bg-[#0d1b2a] border ${border} p-5 rounded-sm`}>
                <div className={`w-9 h-9 ${bg} ${color} flex items-center justify-center rounded-sm mb-4`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className={`font-black text-2xl ${color}`}>{value}</p>
                <p className="text-[#7a8a99] text-[10px] font-black uppercase tracking-widest mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-[#0d1b2a] border border-[#1a2840] rounded-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2840]">
            <h2 className="font-black uppercase tracking-wider text-white text-sm">Recent Orders</h2>
            <Link href="/admin/orders">
              <span className="text-[#b8973a] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:text-[#d4af6a] transition-colors cursor-pointer">
                View All <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-[#111f33] animate-pulse rounded-sm" />)}
            </div>
          ) : !stats?.recentOrders?.length ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-8 h-8 text-[#1a2840] mx-auto mb-3" />
              <p className="text-[#7a8a99] text-xs font-bold uppercase tracking-widest">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2840]">
                    {["Order #", "Customer", "City", "Items", "Total", "Status", "Date"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#4a5568]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2840]">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#111f33] transition-colors">
                      <td className="px-5 py-3.5">
                        <Link href="/admin/orders">
                          <span className="font-black text-[#b8973a] text-sm cursor-pointer hover:text-[#d4af6a]">#{order.id}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-white text-sm">{order.customerName}</p>
                        <p className="text-[#7a8a99] text-[10px]">{order.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[#7a8a99] text-sm font-bold">{order.city}</td>
                      <td className="px-5 py-3.5 text-[#7a8a99] text-sm font-bold">{(order.items as unknown[]).length}</td>
                      <td className="px-5 py-3.5 font-black text-[#b8973a] text-sm">৳{order.total.toFixed(0)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-sm ${STATUS_COLORS[order.status] ?? "bg-zinc-800 text-zinc-400"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#4a5568] text-xs font-bold whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-BD", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
