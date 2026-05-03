import { Link, useLocation } from "wouter";
import { LayoutDashboard, ShoppingBag, Package, LogOut, ExternalLink, Menu, X, Phone, Settings, ChevronRight } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/admin",          icon: LayoutDashboard, label: "Dashboard",   color: "from-violet-500 to-purple-600" },
  { href: "/admin/orders",   icon: ShoppingBag,     label: "Orders",      color: "from-blue-500 to-cyan-600" },
  { href: "/admin/leads",    icon: Phone,            label: "Leads",       color: "from-amber-500 to-orange-600" },
  { href: "/admin/products", icon: Package,          label: "Products",    color: "from-emerald-500 to-teal-600" },
  { href: "/admin/settings", icon: Settings,         label: "Settings",    color: "from-rose-500 to-pink-600" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#07090f", color: "#f0ede8" }}>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`fixed md:relative z-50 flex flex-col w-[230px] h-full flex-shrink-0 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ background: "linear-gradient(180deg, #0d1117 0%, #0a0d14 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <div className="px-5 py-7" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c9a227, #8a6f2b)" }}>
                  <span className="text-[9px] font-black text-black">BS</span>
                </div>
                <span className="font-black uppercase tracking-[0.3em] text-[10px]" style={{ color: "#c9a227" }}>Be Simple</span>
              </div>
              <p className="font-black text-white text-xl tracking-tight leading-none mt-1">Admin Panel</p>
            </div>
            <button className="md:hidden p-1 rounded-md hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 pt-2 pb-1 text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.2)" }}>Navigation</p>
          {NAV.map(({ href, icon: Icon, label, color }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden ${isActive ? "shadow-lg" : "hover:bg-white/[0.04]"}`}
                  style={isActive ? { background: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.25)" } : { border: "1px solid transparent" }}
                >
                  {isActive && <div className="absolute inset-0 opacity-5" style={{ background: `linear-gradient(135deg, ${color.split(" ")[1]}, ${color.split(" ")[3]})` }} />}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${color} shadow-lg`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className={`font-bold text-[12px] tracking-wide flex-1 ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>{label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#c9a227" }} />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-white/[0.04] group">
              <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              <span className="font-bold text-[12px] text-zinc-500 group-hover:text-zinc-300 tracking-wide">View Store</span>
            </div>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-red-500/10 group">
            <LogOut className="w-4 h-4 text-zinc-600 group-hover:text-red-400 transition-colors" />
            <span className="font-bold text-[12px] text-zinc-500 group-hover:text-red-400 tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: "rgba(7,9,15,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <button className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="font-black text-white text-sm">Administrator</p>
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Be Simple 75</p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #c9a227, #8a6f2b)" }}>
              <span className="font-black text-black text-sm">A</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background: "#07090f" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
