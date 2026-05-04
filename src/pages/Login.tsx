import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, ArrowLeft, Mail, Lock, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setAuth(data.user, data.token);
        toast({ title: "Welcome back!", description: `Logged in as ${data.user.name}` });
        setLocation("/dashboard");
      } else {
        toast({ title: "Login failed", description: data.error || "Invalid credentials", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#050508" }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: "radial-gradient(circle, #ff1744 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-10" style={{ background: "radial-gradient(circle, #ff4500 0%, transparent 70%)" }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-3 h-3" /> Back to Store
        </Link>

        <div className="p-8 rounded-3xl bg-[#0f172a]/40 border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2 italic">Sign In</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access your orders & rewards</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium text-white outline-none focus:border-rose-500/50 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium text-white outline-none focus:border-rose-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)", boxShadow: "0 15px 30px -10px rgba(255,23,68,0.4)" }}
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? "Authenticating..." : "Enter the Studio"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">New to Be Simple?</p>
            <Link href="/register">
              <button className="w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <UserPlus className="w-3.5 h-3.5" /> Create an Account
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
