import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ShoppingBag, ChevronDown, Search, RefreshCw } from "lucide-react";

const ADMIN_KEY = "besimple2024";

const STATUSES = ["all", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  confirmed:  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  processing: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  shipped:    "bg-purple-500/20 text-purple-300 border-purple-500/30",
  delivered:  "bg-green-500/20 text-green-300 border-green-500/30",
  cancelled:  "bg-red-500/20 text-red-300 border-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed", processing: "Processing",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
};

interface OrderItem {
  productId: number;
  productName?: string;
  size: string;
  quantity: number;
  price?: number;
}

interface Order {
  id: number;
  customerName: string;
  email: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  total: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
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
      .then((r) => r.json())
      .then((d) => { setOrders(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? orders.filter(o =>
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        String(o.id).includes(q) ||
        o.city.toLowerCase().includes(q)
      ) : orders
    );
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
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "all" ? orders.length : orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-black uppercase tracking-tight text-white text-3xl">Orders</h1>
            <p className="text-[#7a8a99] text-xs font-bold uppercase tracking-widest mt-1">{filtered.length} orders found</p>
          </div>
          <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 border border-[#1a2840] text-[#7a8a99] hover:text-white hover:border-zinc-500 transition-all text-xs font-black uppercase tracking-widest self-start">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status tabs */}
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border rounded-sm transition-all ${
                  activeStatus === s
                    ? "bg-[#b8973a] border-[#b8973a] text-[#0a1628]"
                    : "border-[#1a2840] text-[#7a8a99] hover:border-zinc-500 hover:text-white"
                }`}
              >
                {s === "all" ? "All" : STATUS_LABELS[s]} {counts[s] > 0 && <span className="ml-1 opacity-70">({counts[s]})</span>}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a5568]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="pl-9 pr-4 h-9 bg-[#0d1b2a] border border-[#1a2840] text-white text-sm font-bold focus:outline-none focus:border-[#b8973a] transition-colors placeholder:text-[#4a5568] w-full sm:w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0d1b2a] border border-[#1a2840] rounded-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-[#111f33] animate-pulse rounded-sm" />)}
            </div>
          ) : !filtered.length ? (
            <div className="py-20 text-center">
              <ShoppingBag className="w-10 h-10 text-[#1a2840] mx-auto mb-3" />
              <p className="text-[#7a8a99] text-xs font-black uppercase tracking-widest">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2840]">
                    {["#", "Customer", "City", "Items", "Total", "Status", "Date", "Action"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#4a5568] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2840]">
                  {filtered.map((order) => (
                    <>
                      <tr
                        key={order.id}
                        className="hover:bg-[#111f33] transition-colors cursor-pointer"
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      >
                        <td className="px-4 py-3.5">
                          <span className="font-black text-[#b8973a] text-sm">#{order.id}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-white text-sm whitespace-nowrap">{order.customerName}</p>
                          <p className="text-[#7a8a99] text-[10px]">{order.email}</p>
                        </td>
                        <td className="px-4 py-3.5 text-[#7a8a99] text-sm font-bold whitespace-nowrap">{order.city}</td>
                        <td className="px-4 py-3.5 text-[#7a8a99] text-sm font-bold">{order.items.length}</td>
                        <td className="px-4 py-3.5 font-black text-[#b8973a] text-sm whitespace-nowrap">৳{order.total.toFixed(0)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-sm whitespace-nowrap ${STATUS_COLORS[order.status] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                            {STATUS_LABELS[order.status] ?? order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[#4a5568] text-xs font-bold whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString("en-BD", { day: "2-digit", month: "short" })}
                          <br />
                          <span className="text-[#4a5568]">{new Date(order.createdAt).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}</span>
                        </td>
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                              disabled={updatingId === order.id}
                              className="appearance-none bg-[#111f33] border border-[#1a2840] text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 pr-7 focus:outline-none focus:border-[#b8973a] transition-colors disabled:opacity-50 cursor-pointer hover:border-zinc-500"
                            >
                              {["confirmed","processing","shipped","delivered","cancelled"].map(s => (
                                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#7a8a99] pointer-events-none" />
                          </div>
                        </td>
                      </tr>
                      {expandedId === order.id && (
                        <tr key={`${order.id}-exp`} className="bg-[#060e1a]">
                          <td colSpan={8} className="px-6 py-4 border-b border-[#1a2840]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#b8973a] mb-2">Shipping Address</p>
                                <p className="text-white font-bold text-sm">{order.customerName}</p>
                                <p className="text-[#7a8a99] text-sm">{order.address}</p>
                                <p className="text-[#7a8a99] text-sm">{order.city}, {order.zipCode}</p>
                                <p className="text-[#7a8a99] text-sm">{order.country}</p>
                                <p className="text-[#7a8a99] text-sm mt-1">{order.email}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#b8973a] mb-2">Items ({order.items.length})</p>
                                <div className="space-y-1.5">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                      <span className="text-[#7a8a99] font-bold">{item.productName ?? `Product #${item.productId}`} · {item.size} × {item.quantity}</span>
                                      <span className="text-[#b8973a] font-black">৳{((item.price ?? 0) * item.quantity).toFixed(0)}</span>
                                    </div>
                                  ))}
                                  <div className="flex justify-between items-center text-sm pt-2 border-t border-[#1a2840] mt-2">
                                    <span className="font-black text-white uppercase tracking-wider">Total</span>
                                    <span className="font-black text-[#b8973a] text-base">৳{order.total.toFixed(0)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
