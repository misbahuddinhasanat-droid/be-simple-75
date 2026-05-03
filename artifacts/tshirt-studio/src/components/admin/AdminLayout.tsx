import { Link, useLocation } from "wouter";
import { LayoutDashboard, ShoppingBag, Package, LogOut, ExternalLink, Menu, X, Phone, Settings } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/admin",          icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/orders",   icon: ShoppingBag,     label: "Orders" },
  { href: "/admin/leads",    icon: Phone,            label: "Leads" },
  { href: "/admin/products", icon: Package,          label: "Products" },
  { href: "/admin/settings", icon: Settings,         label: "Settings" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex h-screen bg-[#060e1a] text-[#f5f0e8] overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 flex flex-col w-[220px] h-full bg-[#0d1b2a] border-r border-[#1a2840] flex-shrink-0 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="px-5 py-6 border-b border-[#1a2840]">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black uppercase tracking-[0.2em] text-[#b8973a] text-xs">Be Simple</p>
              <p className="font-black uppercase tracking-widest text-white text-lg leading-tight">Admin</p>
            </div>
            <button className="md:hidden text-zinc-500 hover:text-white" onClick={() => setMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer transition-all ${
                  isActive
                    ? "bg-[#b8973a]/15 border border-[#b8973a]/40 text-[#b8973a]"
                    : "text-[#7a8a99] hover:bg-[#1a2840] hover:text-[#f5f0e8] border border-transparent"
                }`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-bold uppercase tracking-wider text-[11px]">{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#1a2840] space-y-1">
          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2.5 text-[#7a8a99] hover:text-[#f5f0e8] hover:bg-[#1a2840] rounded-sm cursor-pointer transition-all">
              <ExternalLink className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider text-[11px]">View Store</span>
            </div>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-[#7a8a99] hover:text-red-400 hover:bg-[#1a2840] rounded-sm transition-all">
            <LogOut className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider text-[11px]">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1a2840] bg-[#0a1628] flex-shrink-0">
          <button className="md:hidden text-zinc-400 hover:text-white" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <div className="w-8 h-8 rounded-full bg-[#b8973a] flex items-center justify-center">
              <span className="font-black text-[#0a1628] text-xs">A</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-black text-white text-xs uppercase tracking-widest">Admin</p>
              <p className="text-[#7a8a99] text-[10px] font-bold uppercase tracking-wide">Be Simple 75</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#060e1a] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
