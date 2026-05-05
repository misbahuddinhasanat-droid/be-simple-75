import { Link } from "wouter";
import { ShoppingBag, Menu, X, User, Heart, LayoutDashboard, Truck, Info, HelpCircle, Phone, MessageCircle } from "lucide-react";
import { useGetCart } from "@/lib/cart-store";
import { useAuthStore } from "@/lib/auth-store";
import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

export function Navbar() {
  const { data: cart } = useGetCart();
  const { token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const { data: settings } = useSettings();
  const itemCount = cart?.itemCount || 0;

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsOpen(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const phoneDigits = settings?.storeInfo?.whatsappNumber?.replace(/\D/g, "") ?? "";
  const callHref = phoneDigits ? `tel:+${phoneDigits}` : "tel:";

  const navLinks = [
    { href: "/products", label: "Shop All" },
    { href: "/customize", label: "Studio" },
    { href: "/design-templates", label: "Templates" },
    { href: "/track-order", label: "Track Order" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  const mobileLinks = [
    ...navLinks,
    { href: "/wishlist", label: "Wishlist", icon: <Heart className="w-4 h-4" /> },
    { href: "/about", label: "About Us", icon: <Info className="w-4 h-4" /> },
    { href: "/faq", label: "FAQs", icon: <HelpCircle className="w-4 h-4" /> },
    { href: callHref, label: "Call Us", icon: <Phone className="w-4 h-4" /> },
    { href: settings?.storeInfo?.whatsappUrl || "#", label: "WhatsApp", icon: <MessageCircle className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full navbar-gradient-border relative" style={{ background: "rgba(5,5,8,0.88)", backdropFilter: "blur(20px)" }}>
      <div className="container flex h-20 items-center justify-between px-4 md:px-8 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Be Simple 75" className="w-16 h-16 md:w-[72px] md:h-[72px] object-contain" style={{ filter: "drop-shadow(0 0 32px rgba(255,255,255,1)) brightness(3) contrast(1.15) saturate(1.05)" }} />
          <div className="flex flex-col -gap-1 hidden xs:flex">
            <span className="font-black text-xl uppercase tracking-wider text-white">Be Simple</span>
            <span className="text-[10px] font-black tracking-[0.3em] text-rose-500 -mt-1">PREMIUM STORE</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={`${href === '/track-order' ? 'text-rose-500' : 'text-slate-400'} hover:text-white transition-all duration-200 relative group`}>
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #ff1744, #ff4500)" }} />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/cart">
            <button className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 touch-ripple magnetic" style={{ background: itemCount > 0 ? "rgba(255,23,68,0.15)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,23,68,0.2)" }}>
              <ShoppingBag className="h-5 w-5 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)" }}>
                  {itemCount}
                </span>
              )}
            </button>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <Link href="/track-order">
              <button className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 bg-white/5 border border-white/10 text-slate-400 hover:text-white touch-ripple magnetic">
                <Truck className="h-5 w-5" />
              </button>
            </Link>

            <Link href="/wishlist">
              <button className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 bg-white/5 border border-white/10 touch-ripple magnetic">
                <Heart className="h-5 w-5 text-white" />
              </button>
            </Link>

            <Link href={token ? "/dashboard" : "/login"}>
              <button className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 touch-ripple magnetic" style={{ background: token ? "rgba(255,23,68,0.1)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,23,68,0.2)" }}>
                {token ? <LayoutDashboard className="h-5 w-5 text-rose-500" /> : <User className="h-5 w-5 text-white" />}
              </button>
            </Link>
          </div>

          <button className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-white" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,23,68,0.2)" }} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden py-8 px-6 flex flex-col gap-6" style={{ borderTop: "1px solid rgba(255,23,68,0.15)", background: "rgba(5,5,8,0.98)" }}>
          {mobileLinks.map(({ href, label, icon }) => (
            <Link key={`${href}-${label}`} href={href || "#"} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 text-lg font-black uppercase tracking-widest ${href === '/track-order' ? 'text-rose-500' : 'text-white'}`}>
              {icon} {label}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-white/5 flex flex-col gap-4">
             <Link href={token ? "/dashboard" : "/login"} onClick={() => setIsOpen(false)} className="btn-ai h-12 flex items-center justify-center rounded-xl text-xs">
               {token ? "Go to Dashboard" : "Sign In / Register"}
             </Link>
          </div>
        </div>
      )}
    </header>
  );
}
