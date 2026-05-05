import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderStatus {
  id: number;
  status: string;
  customerName: string;
  productName: string;
  totalAmount: number;
  createdAt: string;
}

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const oid = q.get("order") || q.get("id") || q.get("orderId");
    if (oid) setOrderId(oid);
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/customer/track?id=${orderId}&phone=${phone}`);
      const data = await res.json();
      
      if (res.ok) {
        setOrder(data);
      } else {
        setError(data.error || "Order not found. Please check your ID and phone number.");
      }
    } catch (err) {
      setError("Failed to connect. Please try again.");
    }
    setLoading(false);
  };

  const getSteps = (status: string) => [
    { label: "Confirmed", icon: <CheckCircle2 className="w-4 h-4" />, done: true },
    { label: "Processing", icon: <Clock className="w-4 h-4" />, done: ["processing", "shipped", "delivered"].includes(status) },
    { label: "Shipped", icon: <Truck className="w-4 h-4" />, done: ["shipped", "delivered"].includes(status) },
    { label: "Delivered", icon: <Package className="w-4 h-4" />, done: status === "delivered" },
  ];

  return (
    <div className="min-h-screen pb-20" style={{ background: "#050508", color: "#f5f6fa" }}>
      <div className="container px-4 md:px-8 pt-32 max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-3 h-3" /> Back to Store
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2 italic">Track <span className="gradient-text">Order</span></h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Enter your order details to see real-time status</p>
        </div>

        <form onSubmit={handleTrack} className="p-8 rounded-3xl bg-[#0f172a]/40 border border-white/5 backdrop-blur-xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Order ID</label>
              <input
                type="text"
                required
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium text-white outline-none focus:border-rose-500/50 transition-all"
                placeholder="e.g. 1045"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium text-white outline-none focus:border-rose-500/50 transition-all"
                placeholder="01XXXXXXXXX"
              />
            </div>
          </div>
          <button
            disabled={loading}
            className="w-full mt-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)", boxShadow: "0 15px 30px -10px rgba(255,23,68,0.4)" }}
          >
            {loading ? <Search className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Searching..." : "Track My Package"}
          </button>
          {error && <p className="text-center text-xs font-bold text-rose-500 mt-4">{error}</p>}
        </form>

        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-white mb-1">Status: <span className="text-rose-500">{order.status}</span></h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Order #{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white italic">৳{order.totalAmount.toFixed(0)}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Paid</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {getSteps(order.status).map((step, i) => (
                  <div key={i} className="text-center space-y-3">
                    <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center transition-all ${step.done ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white/5 text-slate-700'}`}>
                      {step.icon}
                    </div>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${step.done ? 'text-white' : 'text-slate-700'}`}>{step.label}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                <div className="flex items-start gap-4">
                  <Package className="w-4 h-4 text-slate-500 mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Product</p>
                    <p className="text-sm font-bold text-white">{order.productName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-4 h-4 text-slate-500 mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Shipping To</p>
                    <p className="text-sm font-bold text-white">{order.customerName}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Need help with this order?</p>
                <div className="flex justify-center gap-4">
                  <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all">Support Chat</button>
                  <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 transition-all">WhatsApp</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
