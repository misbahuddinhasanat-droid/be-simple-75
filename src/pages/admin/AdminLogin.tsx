import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Flame, Zap } from "lucide-react";

const CORRECT_PASSWORD = "Besimple90@@";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        localStorage.setItem("admin_auth", "Besimple90@@");
        setLocation("/admin/dashboard");
      } else {
        setError("Incorrect password. Access denied.");
        setLoading(false);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "#050508" }}>
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 orb-red"
          style={{ background: "radial-gradient(circle, #ff1744 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full blur-3xl opacity-15 orb-orange"
          style={{ background: "radial-gradient(circle, #ff4500 0%, transparent 70%)" }} />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "linear-gradient(rgba(255,23,68,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,23,68,1) 1px,transparent 1px)", backgroundSize: "50px 50px" }} />

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(7,3,14,0.95)", border: "1px solid rgba(255,23,68,0.2)", boxShadow: "0 0 80px rgba(255,23,68,0.08)" }}>
          <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #ff1744, #ff4500, #ff6b35)" }} />

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-4 overflow-hidden bg-white/5 border border-white/10"
                style={{ boxShadow: "0 0 40px rgba(255,23,68,0.2)" }}>
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-2" />
              </div>
              <h1 className="font-black text-3xl uppercase tracking-tight gradient-text-red-orange">Be Simple 75</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mt-1">Admin Access</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3.5 pr-11 rounded-xl bg-transparent text-sm font-medium text-white placeholder-slate-700 outline-none transition-all duration-200"
                    style={{ border: error ? "1px solid rgba(255,23,68,0.6)" : "1px solid rgba(255,23,68,0.2)", background: "rgba(255,23,68,0.04)" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,23,68,0.5)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,23,68,0.12)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = error ? "rgba(255,23,68,0.6)" : "rgba(255,23,68,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-xs font-bold mt-2" style={{ color: "#ff1744" }}>{error}</p>}
              </div>

              <button type="submit" disabled={loading || !password}
                className="btn-ai w-full flex items-center justify-center gap-2.5 disabled:opacity-50 rounded-xl"
                style={{ height: "52px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {loading ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                  ) : <Zap className="w-4 h-4" fill="currentColor" />}
                  {loading ? "Authenticating…" : "Enter Console"}
                </span>
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-700 mt-6">
          Be Simple 75 &mdash; Secured Admin Portal
        </p>
      </div>
    </div>
  );
}
