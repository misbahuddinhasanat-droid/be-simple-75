import { useState } from "react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      localStorage.setItem("admin_auth", "besimple2024");
      setLocation("/admin");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-[#060e1a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-black uppercase tracking-[0.3em] text-[#b8973a] text-xs mb-2">Be Simple 75</p>
          <h1 className="font-black uppercase tracking-tight text-white text-4xl">Admin</h1>
          <p className="text-[#7a8a99] text-xs font-bold uppercase tracking-widest mt-2">Restricted access</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0d1b2a] border border-[#1a2840] p-8 space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#7a8a99] mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter password"
              autoFocus
              className="w-full h-12 bg-[#111f33] border border-[#1a2840] px-4 text-white font-bold text-sm focus:outline-none focus:border-[#b8973a] transition-colors placeholder:text-[#4a5568]"
            />
            {error && (
              <p className="text-red-400 text-[11px] font-bold uppercase tracking-wider mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-[#b8973a] hover:bg-[#d4af6a] text-[#0a1628] font-black uppercase tracking-widest text-sm transition-colors"
          >
            Enter Dashboard
          </button>
        </form>

        <p className="text-center text-[#4a5568] text-[10px] font-bold uppercase tracking-widest mt-6">
          Be Simple 75 · Admin Portal
        </p>
      </div>
    </div>
  );
}
