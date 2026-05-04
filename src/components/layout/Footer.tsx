import { Link } from "wouter";
import { ShoppingBag, Instagram, Facebook, Mail, MessageCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export function Footer() {
  const { data: settings } = useSettings();
  const storeInfo = settings?.storeInfo;

  return (
    <footer className="relative overflow-hidden" style={{ borderTop: "1px solid rgba(255,23,68,0.12)", background: "#030305" }}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(255,23,68,0.06) 0%, transparent 70%)" }} />

      <div className="container px-4 py-16 md:py-20 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="Be Simple 75" className="w-12 h-12 object-contain" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.6)) brightness(1.2)" }} />
              <div>
                <span className="font-black text-2xl uppercase tracking-wider text-white">Be Simple 75</span>
                <p className="text-[9px] font-black tracking-[0.4em] text-rose-500 uppercase -mt-1">Streetwear Bangladesh</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
              Where self-expression meets the streets. Premium streetwear built for those who refuse to blend in.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              {[
                { icon: Instagram, color: "#ff1744", label: "Instagram", href: storeInfo?.instagramUrl },
                { icon: Facebook, color: "#1877F2", label: "Facebook", href: storeInfo?.facebookUrl },
                { icon: MessageCircle, color: "#25D366", label: "WhatsApp", href: storeInfo?.whatsappUrl }
              ].map(({ icon: Icon, color, label, href }, i) => (
                <a key={i} href={href || "#"} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 hover:-translate-y-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">{label}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black mb-5 uppercase tracking-widest text-slate-400">Shop</h4>
            <ul className="space-y-3 text-sm font-medium">
              {[{ href: "/products", label: "All Products" }, { href: "/customize", label: "The Studio" }, { href: "/design-templates", label: "Templates" }].map(({ href, label }) => (
                <li key={href}><Link href={href} className="text-slate-500 hover:text-white transition-colors duration-200">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black mb-5 uppercase tracking-widest text-slate-400">Support</h4>
            <ul className="space-y-3 text-sm font-medium">
              {[
                { href: "/contact", label: "Contact Us" },
                { href: "/returns", label: "Return Policy" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/faq", label: "FAQ" }
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-slate-500 hover:text-white transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-600" style={{ borderTop: "1px solid rgba(255,23,68,0.08)" }}>
          <p>&copy; {new Date().getFullYear()} Be Simple 75. All Rights Reserved.</p>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-1 h-1 rounded-full" style={{ background: "linear-gradient(#ff1744,#ff4500)" }} />
            <span>Built for the bold. Delivered to Bangladesh.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
