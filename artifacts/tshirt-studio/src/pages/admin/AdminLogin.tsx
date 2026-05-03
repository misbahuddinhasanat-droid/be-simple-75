import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (password === "admin123") {
        localStorage.setItem("admin_auth", "besimple2024");
        setLocation("/admin");
      } else {
        setError("Incorrect password. Try again.");
        setPassword("");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#07090f" }}>
      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #c9a227, transparent)", filter: "blur(80px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(100px)" }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-2xl"
            style={{ background: "linear-gradient(135deg, #c9a227 0%, #8a6f2b 100%)", boxShadow: "0 8px 40px rgba(201,162,39,0.35)" }}>
            <ShieldCheck className="w-7 h-7 text-black" />
          </div>
          <p className="font-black uppercase tracking-[0.35em] text-[10px] mb-1.5" style={{ color: "#c9a227" }}>Be Simple 75</p>
          <h1 className="font-black text-white text-4xl tracking-tight">Admin Panel</h1>
          <p className="text-sm font-medium mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>Restricted access — authorized only</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit}
          className="rounded-2xl p-8 space-y-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Admin Password
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password"
                autoFocus
                className="w-full h-12 px-4 pr-12 text-white text-sm font-medium focus:outline-none transition-all rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${error ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.09)"}`,
                }}
                onFocus={e => {
                  if (!error) (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(201,162,39,0.5)";
                  (e.currentTarget as HTMLInputElement).style.background = "rgba(255,255,255,0.07)";
                }}
                onBlur={e => {
                  if (!error) (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.09)";
                  (e.currentTarget as HTMLInputElement).style.background = "rgba(255,255,255,0.05)";
                }}
              />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "rgba(255,255,255,0.25)" }}>
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-[11px] font-bold mt-2" style={{ color: "#f87171" }}>{error}</p>
            )}
          </div>

          <button type="submit" disabled={loading || !password}
            className="w-full h-12 text-sm font-black uppercase tracking-widest transition-all rounded-xl disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #c9a227 0%, #8a6f2b 100%)",
              color: "#000",
              boxShadow: loading ? "none" : "0 4px 24px rgba(201,162,39,0.3)",
            }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying…
              </span>
            ) : "Enter Dashboard"}
          </button>
        </form>

        <p className="text-center text-[10px] font-bold uppercase tracking-widest mt-6" style={{ color: "rgba(255,255,255,0.15)" }}>
          Be Simple 75 · Secure Admin Portal
        </p>
      </div>
    </div>
  );
}
