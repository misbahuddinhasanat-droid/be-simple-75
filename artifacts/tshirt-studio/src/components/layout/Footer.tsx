import { Link } from "wouter";
import { Flame, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ borderTop: "1px solid rgba(255,23,68,0.12)", background: "#030305" }}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(255,23,68,0.06) 0%, transparent 70%)" }} />

      <div className="container px-4 py-16 md:py-20 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)" }}>
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-xl uppercase tracking-wider gradient-text-red-orange">Be Simple 75</span>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
              Where self-expression meets the streets. Premium streetwear built for those who refuse to blend in.
            </p>
            <div className="flex gap-3 mt-6">
              {[{ icon: Instagram, color: "#ff1744" }, { icon: Twitter, color: "#ff4500" }].map(({ icon: Icon, color }, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
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
              {["FAQ", "Shipping Info", "Contact", "Returns"].map(label => (
                <li key={label}><a href="#" className="text-slate-500 hover:text-white transition-colors duration-200">{label}</a></li>
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
