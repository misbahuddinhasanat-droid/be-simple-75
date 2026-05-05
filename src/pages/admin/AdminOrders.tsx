import { useEffect, useState, useCallback, Fragment } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ShoppingCart, ChevronDown, Search, RefreshCw, Package, MapPin, Phone, Zap, Mail, Layers } from "lucide-react";

const ADMIN_KEY = "Besimple90@@";
const STATUSES = ["all", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_CFG: Record<string, { label: string; dot: string; bg: string }> = {
  confirmed:  { label: "Confirmed",  dot: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  processing: { label: "Processing", dot: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  shipped:    { label: "Shipped",    dot: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  delivered:  { label: "Delivered",  dot: "#34d399", bg: "rgba(52,211,153,0.1)" },
  cancelled:  { label: "Cancelled",  dot: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

interface OrderItem {
  itemId: string;
  productName: string;
  size: string;
  quantity: number;
  price: number;
  productImageUrl?: string;
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  email: string;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
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
      const res = await fetch(`/api/admin/leads?phone=${phone}`, { headers: { "X-Admin-Key": ADMIN_KEY } });
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
    if (search.trim()) { 
      const q = search.toLowerCase(); 
      list = list.filter(o => 
        o.customerName.toLowerCase().includes(q) || 
        o.customerPhone.includes(q) || 
        String(o.id).includes(q) ||
        o.email?.toLowerCase().includes(q)
      ); 
    }
    setFiltered(list);
  }, [orders, statusFilter, search]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await fetch(`/api/admin/orders?id=${id}`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY }, 
        body: JSON.stringify({ status }) 
      });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch { /* silent */ }
    setUpdating(null);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-3xl uppercase tracking-tight text-white italic">Manifest Log</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1">{filtered.length} of {orders.length} Units Pipeline</p>
          </div>
          <button onClick={fetchOrders} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all glass-dark hover:bg-white/5 active:scale-95"
            style={{ border: "1px solid rgba(255,23,68,0.2)", color: "#ff1744" }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />Uplink
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-rose-500 transition-colors" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, Name, Phone, Email…"
              className={`${AI_INPUT} pl-12 h-12 rounded-xl`} style={AI_INPUT_STYLE} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar bg-white/2 p-1.5 rounded-xl border border-white/5">
            {STATUSES.map(s => {
              const cfg = STATUS_CFG[s];
              return (
                <button key={s} onClick={() => setStatus(s)}
                  className="px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all"
                  style={statusFilter === s
                    ? { background: cfg ? cfg.bg : "rgba(255,255,255,0.1)", color: cfg ? cfg.dot : "white", border: `1px solid ${cfg ? cfg.dot + "50" : "rgba(255,255,255,0.2)"}` }
                    : { color: "#475569" }}>
                  {s === "all" ? "All Drops" : STATUS_CFG[s]?.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] overflow-hidden glass-dark border border-white/5">
          <div className="hidden md:grid grid-cols-12 px-6 py-4 border-b border-white/5">
            {[["2", "Payload"], ["3", "Signatory"], ["3", "Composition"], ["2", "Valuation"], ["2", "Status"]].map(([cols, label]) => (
              <div key={label} className={`col-span-${cols} text-[9px] font-black uppercase tracking-widest text-slate-600`}>{label}</div>
            ))}
          </div>

          {loading ? (
            <div className="p-8 space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-2xl bg-white/2 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-600">
              <ShoppingCart className="w-16 h-16 mb-6 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Transmissions</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map(order => {
                const cfg = STATUS_CFG[order.status] || { label: order.status, dot: "#64748b", bg: "rgba(100,116,139,0.1)" };
                const isExp = expanded === order.id;
                const firstItem = order.items?.[0];
                return (
                  <Fragment key={order.id}>
                    <div className={`grid grid-cols-12 items-center px-6 py-5 cursor-pointer transition-all duration-300 ${isExp ? 'bg-rose-500/[0.03]' : 'hover:bg-white/[0.02]'}`}
                      onClick={() => setExpanded(isExp ? null : order.id)}>
                      <div className="col-span-6 md:col-span-2 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-500/10 border border-rose-500/20">
                          <Zap className="w-4 h-4 text-rose-500" fill="currentColor" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-widest text-white italic">#{order.id}</p>
                          <p className="text-[9px] font-bold text-slate-600">{new Date(order.createdAt).toLocaleDateString("en-BD")}</p>
                        </div>
                      </div>
                      <div className="hidden md:block col-span-3">
                        <p className="text-xs font-black uppercase tracking-wide text-white truncate">{order.customerName}</p>
                        <p className="text-[9px] font-bold text-slate-600 tracking-wider">{order.customerPhone}</p>
                      </div>
                      <div className="hidden md:block col-span-3">
                        <p className="text-xs font-bold text-slate-300 truncate">
                          {order.items.length > 1 ? `${order.items.length} Units Combined` : (firstItem?.productName || "Product")}
                        </p>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                          {firstItem?.size} · {order.items.reduce((acc, i) => acc + i.quantity, 0)} Units
                        </p>
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <p className="text-sm font-black text-white italic">৳{order.total?.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="col-span-2 md:col-span-2 flex items-center justify-between">
                        <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest"
                          style={{ background: cfg.bg, color: cfg.dot, border: `1px solid ${cfg.dot}30` }}>
                          {cfg.label}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-500 ${isExp ? "rotate-180 text-rose-500" : ""}`} />
                      </div>
                    </div>

                    {isExp && (
                      <div className="px-8 py-8 border-t border-white/5 bg-black/40">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                          {/* Item Details */}
                          <div className="lg:col-span-7 space-y-6">
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mb-2">Payload Details</p>
                             <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-6 p-4 rounded-2xl bg-white/2 border border-white/5">
                                     <div className="w-16 h-20 bg-black rounded-lg overflow-hidden border border-white/10">
                                        <img src={item.productImageUrl || "/logo.png"} className="w-full h-full object-cover" alt="" />
                                     </div>
                                     <div className="flex-1">
                                        <h4 className="text-xs font-black uppercase tracking-wide text-white mb-1">{item.productName}</h4>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Size {item.size} · {item.quantity} Units · ৳{item.price}</p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>

                          {/* Customer & Actions */}
                          <div className="lg:col-span-5 space-y-8">
                             <div className="grid grid-cols-2 gap-6">
                                <div>
                                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3 flex items-center gap-2"><Phone className="w-3 h-3" /> Signatory</p>
                                   <p className="text-xs font-black text-white">{order.customerName}</p>
                                   <p className="text-[11px] font-bold text-slate-400 mt-1">{order.customerPhone}</p>
                                   <p className="text-[11px] font-bold text-slate-500 mt-1">{order.email}</p>
                                </div>
                                <div>
                                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3 flex items-center gap-2"><MapPin className="w-3 h-3" /> Coordinate</p>
                                   <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase">{order.address}</p>
                                   <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">{order.city}</p>
                                </div>
                             </div>

                             <div className="p-5 rounded-2xl bg-white/2 border border-white/5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-4">Risk Assessment (Fraud BD)</p>
                                {!fraudData[order.id] ? (
                                  <button onClick={() => checkFraud(order.id, order.customerPhone)} disabled={checkingFraud === order.id}
                                    className="w-full btn-ai h-10 text-[9px] rounded-xl flex items-center justify-center gap-2">
                                    {checkingFraud === order.id ? "Analyzing..." : "Analyze Signal"}
                                  </button>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reputation Grade:</span>
                                       <span className={`text-sm font-black italic ${['A+', 'A', 'B'].includes(fraudData[order.id].grade) ? 'text-emerald-500' : 'text-rose-500'}`}>{fraudData[order.id].grade || 'N/A'}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                       <div className="h-full bg-rose-500" style={{ width: `${fraudData[order.id].cancelRate || 0}%` }} />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-500">Signal: {fraudData[order.id].totalOrder || 0} Drops · {fraudData[order.id].cancelOrder || 0} Aborted ({fraudData[order.id].cancelRate || 0}%)</p>
                                  </div>
                                )}
                             </div>

                             <div className="space-y-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3">Update Manifest Status</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(STATUS_CFG).map(([key, { label, dot, bg }]) => (
                                    <button key={key} onClick={() => updateStatus(order.id, key)} disabled={updating === order.id || order.status === key}
                                      className="px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 text-center"
                                      style={order.status === key
                                        ? { background: bg, color: dot, border: `1px solid ${dot}50` }
                                        : { background: "rgba(255,255,255,0.02)", color: "#475569", border: "1px solid rgba(255,255,255,0.05)" }}>
                                      {updating === order.id && order.status !== key ? "…" : label}
                                    </button>
                                  ))}
                                </div>
                             </div>
                          </div>
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
