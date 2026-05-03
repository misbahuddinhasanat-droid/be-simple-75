import { Link } from "wouter";
import { ShoppingBag, Menu, X, Sparkles } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";
import { useState } from "react";

export function Navbar() {
  const { data: cart } = useGetCart();
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = cart?.itemCount || 0;

  return (
    <header className="sticky top-0 z-50 w-full navbar-gradient-border relative" style={{ background: "rgba(5,5,15,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="container flex h-18 items-center justify-between px-4 md:px-8 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a855f7, #22d3ee)" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-xl uppercase tracking-wider gradient-text-purple-cyan">
            Be Simple
          </span>
          <span className="text-[10px] font-black text-purple-400/70 border border-purple-500/30 px-1.5 py-0.5 rounded-full tracking-widest">
            75
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
          {[
            { href: "/products", label: "Shop All" },
            { href: "/customize", label: "Studio" },
            { href: "/design-templates", label: "Templates" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-slate-400 hover:text-white transition-all duration-200 relative group"
            >
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #a855f7, #22d3ee)" }} />
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* New Drop badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-cyan-400 border border-cyan-500/25" style={{ background: "rgba(34,211,238,0.06)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            New Drop
          </div>

          <Link href="/cart">
            <button className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105" style={{ background: itemCount > 0 ? "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2))" : "rgba(255,255,255,0.05)", border: "1px solid rgba(168,85,247,0.2)" }}>
              <ShoppingBag className="h-5 w-5 text-white" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white"
                  style={{ background: "linear-gradient(135deg, #a855f7, #22d3ee)" }}
                >
                  {itemCount}
                </span>
              )}
            </button>
          </Link>

          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-white transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(168,85,247,0.2)" }}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="md:hidden py-6 px-6 flex flex-col gap-5"
          style={{ borderTop: "1px solid rgba(168,85,247,0.15)", background: "rgba(5,5,15,0.98)" }}
        >
          {[
            { href: "/products", label: "Shop All" },
            { href: "/customize", label: "Studio" },
            { href: "/design-templates", label: "Templates" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className="text-xl font-black uppercase tracking-widest text-white"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
