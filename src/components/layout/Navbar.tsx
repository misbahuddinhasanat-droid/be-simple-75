import { Link } from "wouter";
import { ShoppingBag, Menu, X, Flame } from "lucide-react";
import { useGetCart } from "@/lib/cart-store";
import { useState } from "react";

export function Navbar() {
  const { data: cart } = useGetCart();
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = cart?.itemCount || 0;

  return (
    <header className="sticky top-0 z-50 w-full navbar-gradient-border relative" style={{ background: "rgba(5,5,8,0.88)", backdropFilter: "blur(20px)" }}>
      <div className="container flex h-18 items-center justify-between px-4 md:px-8 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Be Simple 75" className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110" />
          <div className="flex flex-col -gap-1">
            <span className="font-black text-xl uppercase tracking-wider text-white">Be Simple</span>
            <span className="text-[10px] font-black tracking-[0.3em] text-rose-500 -mt-1">PREMIUM STORE</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
          {[{ href: "/products", label: "Shop All" }, { href: "/customize", label: "Studio" }, { href: "/design-templates", label: "Templates" }].map(({ href, label }) => (
            <Link key={href} href={href} className="text-slate-400 hover:text-white transition-all duration-200 relative group">
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #ff1744, #ff4500)" }} />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ background: "rgba(255,23,68,0.08)", border: "1px solid rgba(255,23,68,0.2)", color: "#ff1744" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            New Drop
          </div>

          <Link href="/cart">
            <button className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105" style={{ background: itemCount > 0 ? "rgba(255,23,68,0.15)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,23,68,0.2)" }}>
              <ShoppingBag className="h-5 w-5 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)" }}>
                  {itemCount}
                </span>
              )}
            </button>
          </Link>

          <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-white" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,23,68,0.2)" }} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden py-6 px-6 flex flex-col gap-5" style={{ borderTop: "1px solid rgba(255,23,68,0.15)", background: "rgba(5,5,8,0.98)" }}>
          {[{ href: "/products", label: "Shop All" }, { href: "/customize", label: "Studio" }, { href: "/design-templates", label: "Templates" }].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setIsOpen(false)} className="text-xl font-black uppercase tracking-widest text-white">{label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
