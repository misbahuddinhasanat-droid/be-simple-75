import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Users, Package, Settings, Store,
  LogOut, ExternalLink, Menu, X, Flame, ChevronRight, Zap, Tag
} from "lucide-react";

interface AdminLayoutProps { children: React.ReactNode; }

const NAV = [
  { section: "OVERVIEW", items: [{ href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" }] },
  { section: "STORE", items: [
    { href: "/admin/orders",   icon: ShoppingCart, label: "Orders" },
    { href: "/admin/products", icon: Package,      label: "Products" },
    { href: "/admin/categories", icon: Tag,      label: "Categories" },
    { href: "/admin/inventory", icon: Zap,      label: "Inventory" },
    { href: "/admin/leads",    icon: Users,         label: "Leads & COD" },
  ]},
  { section: "CONFIGURATION", items: [
    { href: "/admin/store-info", icon: Store, label: "Store Info" },
    { href: "/admin/settings", icon: Settings, label: "Integrations" },
  ]},
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { localStorage.removeItem("admin_auth"); window.location.href = "/admin"; };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: "linear-gradient(180deg, #07030e 0%, #09040f 100%)" }}>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: "1px solid rgba(255,23,68,0.12)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-widest gradient-text-red-orange leading-tight">Be Simple 75</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Admin Console</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex-1">Store Live</span>
          <Zap className="w-3 h-3 text-emerald-400" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 px-3" style={{ color: "rgba(255,23,68,0.35)" }}>{section}</p>
            <div className="space-y-0.5">
              {items.map(({ href, icon: Icon, label }) => {
                const isActive = location === href ||
                  (href !== "/admin/dashboard" && location.startsWith(href));
                return (
                  <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer group"
                      style={isActive
                        ? { background: "rgba(255,23,68,0.1)", color: "#ff1744", border: "1px solid rgba(255,23,68,0.22)", boxShadow: "0 0 20px rgba(255,23,68,0.07)" }
                        : { color: "#475569", border: "1px solid transparent" }}>
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${!isActive ? "group-hover:text-slate-300" : ""}`} />
                      <span className={`flex-1 transition-colors duration-200 ${!isActive ? "group-hover:text-slate-300" : ""}`}>{label}</span>
                      {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 space-y-0.5" style={{ borderTop: "1px solid rgba(255,23,68,0.08)" }}>
        <a href="/" target="_blank" rel="noopener noreferrer">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-600 hover:text-slate-300 transition-colors cursor-pointer">
            <ExternalLink className="w-4 h-4" /><span>View Store</span>
          </div>
        </a>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-600 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4" /><span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#050508", color: "#e2e8f0" }}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 overflow-hidden" style={{ borderRight: "1px solid rgba(255,23,68,0.1)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-60 h-full" style={{ borderRight: "1px solid rgba(255,23,68,0.15)" }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-3.5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,23,68,0.08)", background: "rgba(5,5,8,0.85)", backdropFilter: "blur(16px)" }}>
          <button className="md:hidden p-2 rounded-lg text-slate-500 hover:text-white transition-colors" onClick={() => setSidebarOpen(true)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2.5">
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
