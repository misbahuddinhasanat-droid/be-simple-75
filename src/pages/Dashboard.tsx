import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Link, useLocation } from "wouter";
import { Package, User, MapPin, ShoppingBag, LogOut, ChevronRight, Clock, CheckCircle2, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Order {
  id: number;
  status: string;
  total: string;
  createdAt: string;
  items: any[];
}

export default function Dashboard() {
  const { user, token, logout } = useAuthStore();
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLocation("/login");
      return;
    }

    fetch("/api/customer/orders", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, setLocation]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: "#050508", color: "#f5f6fa" }}>
      {/* Header Profile */}
      <div className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent opacity-50" />
        <div className="container px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-3xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center relative group">
              <User className="w-12 h-12 text-rose-500" />
              <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg">Level 1</div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2 italic">{user.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> {orders.length} Orders</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {user.city || "Dhaka, BD"}</span>
              </div>
            </div>
            <div className="md:ml-auto">
              <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black uppercase tracking-widest text-white italic">Recent Orders</h2>
            <Link href="/products" className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline">New Drop Available</Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-32 rounded-3xl animate-pulse bg-white/5" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/10">
              <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">You haven't placed any orders yet.</p>
              <Link href="/products">
                <button className="mt-6 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white" style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)" }}>Start Shopping</button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 rounded-3xl bg-[#0f172a]/40 border border-white/5 hover:border-rose-500/30 transition-all group"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Order #{order.id}</span>
                        <span className="text-[10px] font-bold text-slate-500">•</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{format(new Date(order.createdAt), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex -space-x-3">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="w-12 h-12 rounded-xl border-2 border-[#050508] overflow-hidden bg-slate-900">
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-12 h-12 rounded-xl border-2 border-[#050508] bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">+{order.items.length - 3}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col justify-between items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === "completed" ? "bg-green-500/10 text-green-500" : 
                        order.status === "processing" ? "bg-amber-500/10 text-amber-500" :
                        "bg-rose-500/10 text-rose-500"
                      }`}>
                        {order.status}
                      </span>
                      <p className="text-xl font-black text-white italic">৳{Number(order.total).toFixed(0)}</p>
                      <button className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors flex items-center gap-1">Details <ChevronRight className="w-3 h-3" /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Tracking & Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2 italic">
              <Truck className="w-4 h-4 text-rose-500" /> Track Shipment
            </h3>
            <div className="space-y-6">
              {[
                { status: "Processing", time: "Pending Approval", icon: <Clock className="w-4 h-4" />, current: true },
                { status: "Dispatched", time: "Waiting", icon: <Truck className="w-4 h-4" />, current: false },
                { status: "Delivered", time: "Waiting", icon: <CheckCircle2 className="w-4 h-4" />, current: false },
              ].map((step, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i < 2 && <div className="absolute left-2 top-6 bottom-[-24px] w-0.5 bg-white/5" />}
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center z-10 ${step.current ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-700'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>
                  <div>
                    <p className={`text-[11px] font-black uppercase tracking-wider ${step.current ? 'text-white' : 'text-slate-600'}`}>{step.status}</p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase mt-0.5">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-600 to-rose-900 border border-rose-500/30">
            <h3 className="text-sm font-black text-white uppercase mb-2">Member Rewards</h3>
            <p className="text-[10px] text-rose-100 uppercase tracking-widest font-bold opacity-80 mb-6">Earn points on every purchase</p>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-white w-1/4" />
            </div>
            <p className="text-[9px] font-black text-white uppercase tracking-tighter">250 / 1000 Points to next tier</p>
          </div>
        </div>
      </div>
    </div>
  );
}
