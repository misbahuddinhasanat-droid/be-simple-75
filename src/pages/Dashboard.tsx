import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Link, useLocation } from "wouter";
import { Package, User, MapPin, ShoppingBag, LogOut, ChevronRight, Clock, CheckCircle2, Truck, Download, Zap, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Order {
  id: number;
  status: string;
  totalAmount: string;
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

    fetch("/api/customer?action=orders", {
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
    <div className="min-h-screen pb-20 selection:bg-rose-500/30" style={{ background: "#050508", color: "#f5f6fa" }}>
      {/* ── PROFILE HEADER ────────────────────────────────────────── */}
      <div className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(225,29,72,0.15),transparent_50%)]" />
        <div className="container px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-32 h-32 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center relative group magnetic shadow-[0_0_50px_rgba(225,29,72,0.1)]">
              <User className="w-16 h-16 text-rose-500" />
              <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl shadow-lg border border-white/10">ELITE DROPPER</div>
            </div>
            
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white italic">{user.name.split(' ')[0]}</h1>
                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                   <Zap className="w-5 h-5 text-rose-500" fill="currentColor" />
                </div>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white/5 px-4 py-2 rounded-xl">
                  <Package className="w-3.5 h-3.5 text-rose-500" /> {orders.length} Drops Secured
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white/5 px-4 py-2 rounded-xl">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {user.city || "Dhaka, BD"}
                </div>
              </div>
            </div>

            <div className="md:ml-auto flex gap-4">
              <Link href="/wishlist">
                <button className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all magnetic">
                  <Heart className="w-5 h-5 text-white" />
                </button>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 px-8 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-rose-600/20 hover:border-rose-600/30 transition-all group">
                <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ── ORDERS COLUMN ─────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white italic">Manifest Log</h2>
            <Link href="/products">
              <button className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl bg-rose-600/10 border border-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white transition-all">New Drops</button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-[2.5rem] animate-pulse bg-white/5 border border-white/10" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-20 text-center rounded-[3rem] bg-white/2 border border-dashed border-white/10 glass-dark">
              <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <ShoppingBag className="w-10 h-10 text-rose-500/30" />
              </div>
              <p className="text-xl font-black uppercase tracking-widest text-slate-500 mb-8">Zero drops detected in your history.</p>
              <Link href="/products">
                <button className="btn-ai h-16 px-12 rounded-2xl text-xs">Initialize First Order</button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {orders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative p-8 rounded-[2.5rem] bg-white/2 border border-white/5 hover:border-rose-500/30 hover:bg-white/5 transition-all duration-500 glass-dark overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="flex flex-col lg:flex-row justify-between gap-10 relative z-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500">#{order.id}</div>
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{format(new Date(order.createdAt), "MMM dd, yyyy")}</span>
                        </div>
                        
                        <div className="flex -space-x-4">
                          {(order.items || []).slice(0, 4).map((item: any, i: number) => (
                            <div key={i} className="w-16 h-20 rounded-2xl border-4 border-[#050508] overflow-hidden bg-slate-900 shadow-2xl relative group/img">
                              <img src={item.imageUrl || item.productImageUrl} alt="" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                            </div>
                          ))}
                          {order.items?.length > 4 && (
                            <div className="w-16 h-20 rounded-2xl border-4 border-[#050508] bg-white/5 flex items-center justify-center text-xs font-black text-rose-500 backdrop-blur-sm">+{order.items.length - 4}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col lg:items-end justify-between gap-6">
                        <div className="flex flex-wrap lg:justify-end gap-3">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                            order.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                            order.status === "processing" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-left lg:text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Secured</p>
                          <p className="text-4xl font-black text-white italic tracking-tighter">৳{Number(order.totalAmount).toFixed(0)}</p>
                        </div>
                        <div className="flex gap-3">
                          <Link href={`/order-confirmation/${order.id}`}>
                            <button className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
                              Manifest Details <ChevronRight className="w-3 h-3" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── SIDEBAR COLUMN ────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-8">
          {/* TRACKING CARD */}
          <div className="p-8 rounded-[2.5rem] bg-white/2 border border-white/10 glass-dark relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
             <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8 flex items-center gap-3 italic">
              <div className="p-2 rounded-lg bg-rose-500/10"><Truck className="w-4 h-4 text-rose-500" /></div> Active Tracking
            </h3>
            
            {orders.length > 0 && orders[0].status !== 'completed' ? (
              <div className="space-y-10 pl-2">
                {[
                  { label: "Authorized", sub: "Security Check Clear", done: true, current: false },
                  { label: "In Transit", sub: "Departed Hub", done: orders[0].status === 'shipped', current: orders[0].status === 'processing' },
                  { label: "Delivered", sub: "Reach Destination", done: false, current: orders[0].status === 'shipped' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-6 relative">
                    {i < 2 && <div className={`absolute left-[7px] top-4 bottom-[-44px] w-[2px] ${step.done ? 'bg-rose-500' : 'bg-white/5'}`} />}
                    <div className={`w-4 h-4 rounded-full border-4 ${step.done ? 'bg-rose-500 border-rose-500/30' : step.current ? 'bg-rose-500 animate-pulse border-rose-500/30' : 'bg-slate-800 border-white/5'} z-10 transition-colors`} />
                    <div className={step.done || step.current ? 'opacity-100' : 'opacity-40'}>
                      <p className="text-[11px] font-black uppercase tracking-wider text-white">{step.label}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-widest">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center opacity-40">
                 <Clock className="w-8 h-8 mx-auto mb-4 text-slate-700" />
                 <p className="text-[10px] font-black uppercase tracking-widest">No active shipments</p>
              </div>
            )}
          </div>

          {/* REWARDS CARD */}
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-rose-600 to-rose-900 border border-rose-500/30 shadow-[0_20px_50px_rgba(225,29,72,0.2)]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-black text-white uppercase italic leading-none">Drop Points</h3>
                <p className="text-[9px] text-rose-100 uppercase tracking-widest font-black opacity-70 mt-1">Tier 1 Enthusiast</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                 <Zap className="w-5 h-5 text-white" fill="currentColor" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="h-3 bg-black/20 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "35%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                />
              </div>
              <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black text-white uppercase tracking-tighter">350 Points</p>
                 <p className="text-[10px] font-black text-rose-200 uppercase tracking-tighter">Next: 1000</p>
              </div>
            </div>
            
            <button className="w-full mt-8 h-12 rounded-xl bg-white text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-colors shadow-lg">Redeem Rewards</button>
          </div>
          
          <div className="p-8 rounded-[2.5rem] bg-white/2 border border-white/5 text-center">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Support & Assistance</p>
             <p className="text-xs font-bold text-slate-300 mb-6">Need help with an order?</p>
             <Link href="/faq"><button className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Visit Help Center</button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
