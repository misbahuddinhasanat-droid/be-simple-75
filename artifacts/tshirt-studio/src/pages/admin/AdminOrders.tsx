import { useEffect, useState, useCallback, Fragment } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ShoppingBag, ChevronDown, Search, RefreshCw } from "lucide-react";

const ADMIN_KEY = "besimple2024";

const STATUSES = ["all", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_CFG: Record<string, { label: string; dot: string; bg: string }> = {
  confirmed:  { label: "Confirmed",  dot: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  processing: { label: "Processing", dot: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  shipped:    { label: "Shipped",    dot: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  delivered:  { label: "Delivered",  dot: "#34d399", bg: "rgba(52,211,153,0.12)" },
  cancelled:  { label: "Cancelled",  dot: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

interface OrderItem {
  productId: number; productName?: string; size: string; quantity: number; price?: number;
}
interface Order {
  id: number; customerName: string; email: string; address: string;
  city: string; country: string; zipCode: string; total: number;
  status: string; items: OrderItem[]; createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/orders?status=${activeStatus}`, { headers: { "x-admin-key": ADMIN_KEY } })
      .then(r => r.json()).then((d: Order[]) => { setOrders(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? orders.filter(o =>
      o.customerName.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) ||
      String(o.id).includes(q) || o.city.toLowerCase().includes(q)
    ) : orders);
  }, [orders, search]);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json() as Order;
        setOrders(prev => prev.map(o => o.id === id ? updated : o));
      }
    } finally { setUpdatingId(null); }
  };

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "all" ? orders.length : orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminLayout>
      <div className="space-y-7 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>Order Management</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Orders</h1>
            <p className="text-sm font-medium mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{filtered.length} orders found</p>
          </div>
          <button onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all self-start"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-wrap flex-1">
            {STATUSES.map(s => {
              const sc = STATUS_CFG[s];
              const isActive = activeStatus === s;
              return (
                <button key={s} onClick={() => setActiveStatus(s)}
                  className="px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                  style={{
                    background: isActive ? (s === "all" ? "rgba(201,162,39,0.15)" : sc.bg) : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isActive ? (s === "all" ? "rgba(201,162,39,0.4)" : sc.dot + "55") : "rgba(255,255,255,0.08)"}`,
                    color: isActive ? (s === "all" ? "#c9a227" : sc.dot) : "rgba(255,255,255,0.35)",
                  }}>
                  {s === "all" ? "All" : sc.label}
                  {counts[s] > 0 && <span className="ml-1.5 opacity-60">({counts[s]})</span>}
                </button>
              );
            })}
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.25)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="pl-9 pr-4 h-10 text-white text-sm font-medium focus:outline-none transition-all rounded-xl w-full sm:w-52"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
              onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(201,162,39,0.4)"; }}
              onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.09)"; }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
            </div>
          ) : !filtered.length ? (
            <div className="py-24 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.08)" }} />
              <p className="font-black text-sm uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["#", "Customer", "City", "Items", "Total", "Status", "Date", "Action"].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                        style={{ color: "rgba(255,255,255,0.2)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, idx) => {
                    const sc = STATUS_CFG[order.status];
                    const isLast = idx === filtered.length - 1;
                    return (
                      <Fragment key={order.id}>
                        <tr
                          className="transition-colors cursor-pointer"
                          style={{
                            borderBottom: !isLast || expandedId === order.id ? "1px solid rgba(255,255,255,0.04)" : "none",
                            background: expandedId === order.id ? "rgba(255,255,255,0.025)" : "transparent",
                          }}
                          onMouseEnter={e => { if (expandedId !== order.id) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                          onMouseLeave={e => { if (expandedId !== order.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        >
                          <td className="px-5 py-4">
                            <span className="font-black text-sm" style={{ color: "#c9a227" }}>#{order.id}</span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-white text-sm whitespace-nowrap">{order.customerName}</p>
                            <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{order.email}</p>
                          </td>
                          <td className="px-5 py-4 text-sm font-bold whitespace-nowrap" style={{ color: "rgba(255,255,255,0.45)" }}>{order.city}</td>
                          <td className="px-5 py-4 text-sm font-bold" style={{ color: "rgba(255,255,255,0.45)" }}>{order.items.length}</td>
                          <td className="px-5 py-4 font-black text-sm whitespace-nowrap" style={{ color: "#c9a227" }}>৳{order.total.toFixed(0)}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap"
                              style={{ background: sc?.bg ?? "rgba(255,255,255,0.08)", color: sc?.dot ?? "#fff" }}>
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc?.dot ?? "#fff" }} />
                              {sc?.label ?? order.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[11px] font-bold whitespace-nowrap" style={{ color: "rgba(255,255,255,0.25)" }}>
                            {new Date(order.createdAt).toLocaleDateString("en-BD", { day: "2-digit", month: "short" })}
                            <br />
                            {new Date(order.createdAt).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                            <div className="relative">
                              <select value={order.status}
                                onChange={e => updateStatus(order.id, e.target.value)}
                                disabled={updatingId === order.id}
                                className="appearance-none text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 pr-7 focus:outline-none transition-colors disabled:opacity-50 cursor-pointer rounded-xl"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                {["confirmed","processing","shipped","delivered","cancelled"].map(s => (
                                  <option key={s} value={s}>{STATUS_CFG[s]?.label ?? s}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
                            </div>
                          </td>
                        </tr>

                        {expandedId === order.id && (
                          <tr style={{ borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                            <td colSpan={8} className="px-6 py-5" style={{ background: "rgba(0,0,0,0.2)" }}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#c9a227" }}>Shipping Address</p>
                                  <div className="space-y-0.5 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                                    <p className="font-bold text-white text-sm">{order.customerName}</p>
                                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{order.address}</p>
                                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{order.city}, {order.zipCode}</p>
                                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{order.country}</p>
                                    <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{order.email}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#c9a227" }}>Items ({order.items.length})</p>
                                  <div className="space-y-2">
                                    {order.items.map((item, i) => (
                                      <div key={i} className="flex justify-between items-center text-sm px-3 py-2 rounded-xl"
                                        style={{ background: "rgba(255,255,255,0.04)" }}>
                                        <span className="font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
                                          {item.productName ?? `Product #${item.productId}`} · {item.size} × {item.quantity}
                                        </span>
                                        <span className="font-black" style={{ color: "#c9a227" }}>৳{((item.price ?? 0) * item.quantity).toFixed(0)}</span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between text-sm pt-2 px-3">
                                      <span className="font-black text-white uppercase tracking-wider">Total</span>
                                      <span className="font-black text-lg" style={{ color: "#c9a227" }}>৳{order.total.toFixed(0)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
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
