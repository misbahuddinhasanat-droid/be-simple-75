import { useEffect, useState, useCallback, Fragment } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ShoppingCart, ChevronDown, Search, RefreshCw, Package, MapPin, Phone, Zap } from "lucide-react";

const ADMIN_KEY = "Besimple90@@";
const STATUSES = ["all", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_CFG: Record<string, { label: string; dot: string; bg: string }> = {
  confirmed:  { label: "Confirmed",  dot: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  processing: { label: "Processing", dot: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  shipped:    { label: "Shipped",    dot: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  delivered:  { label: "Delivered",  dot: "#34d399", bg: "rgba(52,211,153,0.1)" },
  cancelled:  { label: "Cancelled",  dot: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

interface Order {
  id: number; customerName: string; customerPhone: string; customerAddress: string;
  productName: string; size: string; color: string; quantity: number;
  totalAmount: number; status: string; notes: string | null; createdAt: string;
}

const AI_INPUT = "w-full px-3 py-2 rounded-lg text-sm font-medium text-white bg-transparent outline-none transition-all";
const AI_INPUT_STYLE = { background: "rgba(255,23,68,0.04)", border: "1px solid rgba(255,23,68,0.15)", color: "#e2e8f0" };

export default function AdminOrders() {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [filtered, setFiltered]   = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatus] = useState("all");
  const [search, setSearch]       = useState("");
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [updating, setUpdating]   = useState<number | null>(null);
  const [fraudData, setFraudData] = useState<Record<number, any>>({});
  const [checkingFraud, setCheckingFraud] = useState<number | null>(null);

  const checkFraud = async (orderId: number, phone: string) => {
    setCheckingFraud(orderId);
    try {
      const res = await fetch(`/api/admin/fraud-check?phone=${phone}`, { headers: { "X-Admin-Key": ADMIN_KEY } });
      const data = await res.json();
      setFraudData(prev => ({ ...prev, [orderId]: data }));
    } catch {
      setFraudData(prev => ({ ...prev, [orderId]: { error: "Failed to check" } }));
    }
    setCheckingFraud(null);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", { headers: { "X-Admin-Key": ADMIN_KEY } });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    let list = [...orders].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (statusFilter !== "all") list = list.filter(o => o.status === statusFilter);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(o => o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q) || String(o.id).includes(q)); }
    setFiltered(list);
  }, [orders, statusFilter, search]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY }, body: JSON.stringify({ status }) });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch { /* silent */ }
    setUpdating(null);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-3xl uppercase tracking-tight text-white">Orders</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">{filtered.length} of {orders.length} total</p>
          </div>
          <button onClick={fetchOrders} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            style={{ background: "rgba(255,23,68,0.08)", border: "1px solid rgba(255,23,68,0.2)", color: "#ff1744" }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, ID…"
              className={`${AI_INPUT} pl-10`} style={AI_INPUT_STYLE} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {STATUSES.map(s => {
              const cfg = STATUS_CFG[s];
              return (
                <button key={s} onClick={() => setStatus(s)}
                  className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all"
                  style={statusFilter === s
                    ? { background: cfg ? cfg.bg : "rgba(255,23,68,0.12)", color: cfg ? cfg.dot : "#ff1744", border: `1px solid ${cfg ? cfg.dot + "50" : "rgba(255,23,68,0.3)"}` }
                    : { background: "rgba(255,255,255,0.03)", color: "#475569", border: "1px solid rgba(255,23,68,0.1)" }}>
                  {s === "all" ? "All" : STATUS_CFG[s]?.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,23,68,0.1)" }}>
          {/* Table head */}
          <div className="hidden md:grid grid-cols-12 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,23,68,0.08)" }}>
            {[["2", "#"], ["3", "Customer"], ["3", "Product"], ["2", "Amount"], ["2", "Status"]].map(([cols, label]) => (
              <div key={label} className={`col-span-${cols} text-[9px] font-black uppercase tracking-widest text-slate-600`}>{label}</div>
            ))}
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
              <ShoppingCart className="w-10 h-10 mb-4 opacity-30" />
              <p className="text-xs font-bold uppercase tracking-widest">No orders found</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,23,68,0.05)" }}>
              {filtered.map(order => {
                const cfg = STATUS_CFG[order.status] || { label: order.status, dot: "#64748b", bg: "rgba(100,116,139,0.1)" };
                const isExp = expanded === order.id;
                return (
                  <Fragment key={order.id}>
                    <div className="grid grid-cols-12 items-center px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => setExpanded(isExp ? null : order.id)}>
                      <div className="col-span-6 md:col-span-2 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,23,68,0.08)", border: "1px solid rgba(255,23,68,0.15)" }}>
                          <Zap className="w-3.5 h-3.5" style={{ color: "#ff1744" }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">#{order.id}</p>
                          <p className="text-[9px] font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString("en-BD")}</p>
                        </div>
                      </div>
                      <div className="hidden md:block col-span-3">
                        <p className="text-xs font-black uppercase tracking-wide text-white truncate">{order.customerName}</p>
                        <p className="text-[10px] font-bold text-slate-600">{order.customerPhone}</p>
                      </div>
                      <div className="hidden md:block col-span-3">
                        <p className="text-xs font-bold text-slate-300 truncate">{order.productName}</p>
                        <p className="text-[10px] font-bold text-slate-600">{order.size} · Qty {order.quantity}</p>
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <p className="text-sm font-black text-white">৳{order.totalAmount.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="col-span-2 md:col-span-2 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                          style={{ background: cfg.bg, color: cfg.dot, border: `1px solid ${cfg.dot}30` }}>
                          {cfg.label}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${isExp ? "rotate-180" : ""}`} />
                      </div>
                    </div>

                    {isExp && (
                      <div className="px-5 py-5 space-y-4" style={{ background: "rgba(255,23,68,0.03)", borderTop: "1px solid rgba(255,23,68,0.06)" }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,23,68,0.08)" }}>
                            <Phone className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Contact</p>
                              <p className="font-bold text-white">{order.customerName}</p>
                              <p className="font-bold text-slate-400 mb-2">{order.customerPhone}</p>
                              
                              {!fraudData[order.id] ? (
                                <button onClick={() => checkFraud(order.id, order.customerPhone)} disabled={checkingFraud === order.id}
                                  className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                                  style={{ background: "rgba(244,63,94,0.1)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.2)" }}>
                                  {checkingFraud === order.id ? "Checking..." : "Check Fraud BD"}
                                </button>
                              ) : fraudData[order.id].error ? (
                                <p className="text-[10px] text-rose-400 font-bold">{fraudData[order.id].error}</p>
                              ) : (
                                <div className="p-2 rounded mt-1" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[9px] font-bold text-slate-400">Grade:</span>
                                    <span className={`text-[11px] font-black ${['A+', 'A', 'B'].includes(fraudData[order.id].grade) ? 'text-emerald-400' : 'text-rose-400'}`}>{fraudData[order.id].grade}</span>
                                  </div>
                                  <p className="text-[9px] text-slate-500 font-medium">Orders: {fraudData[order.id].totalOrder} | Cancelled: {fraudData[order.id].cancelOrder} ({fraudData[order.id].cancelRate}%)</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,23,68,0.08)" }}>
                            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Address</p>
                              <p className="font-bold text-slate-300 leading-relaxed">{order.customerAddress}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,23,68,0.08)" }}>
                            <Package className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Order Info</p>
                              <p className="font-bold text-white">{order.productName}</p>
                              <p className="font-bold text-slate-400">{order.color} · Size {order.size} · Qty {order.quantity}</p>
                              {order.notes && <p className="text-slate-600 mt-1 italic">"{order.notes}"</p>}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mr-2">Update Status:</p>
                          {Object.entries(STATUS_CFG).map(([key, { label, dot, bg }]) => (
                            <button key={key} onClick={() => updateStatus(order.id, key)} disabled={updating === order.id || order.status === key}
                              className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                              style={order.status === key
                                ? { background: bg, color: dot, border: `1px solid ${dot}50` }
                                : { background: "rgba(255,255,255,0.04)", color: "#475569", border: "1px solid rgba(255,23,68,0.1)" }}>
                              {updating === order.id && order.status !== key ? "…" : label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
