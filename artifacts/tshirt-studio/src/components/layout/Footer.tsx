import { Link } from "wouter";
import { Sparkles, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ borderTop: "1px solid rgba(168,85,247,0.15)", background: "#030309" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)" }}
      />

      <div className="container px-4 py-16 md:py-20 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a855f7, #22d3ee)" }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-xl uppercase tracking-wider gradient-text-purple-cyan">Be Simple 75</span>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
              Where self-expression meets the future. Premium streetwear built for those who wear their world differently.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="#"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
              >
                <Instagram className="w-4 h-4 text-purple-400" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)" }}
              >
                <Twitter className="w-4 h-4 text-cyan-400" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-black mb-5 uppercase tracking-widest text-slate-400">Shop</h4>
            <ul className="space-y-3 text-sm font-medium">
              {[
                { href: "/products", label: "All Products" },
                { href: "/customize", label: "The Studio" },
                { href: "/design-templates", label: "Templates" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-slate-500 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-black mb-5 uppercase tracking-widest text-slate-400">Support</h4>
            <ul className="space-y-3 text-sm font-medium">
              {[
                { label: "FAQ" },
                { label: "Shipping Info" },
                { label: "Contact" },
                { label: "Returns" },
              ].map(({ label }) => (
                <li key={label}>
                  <a href="#" className="text-slate-500 hover:text-white transition-colors duration-200">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-600"
          style={{ borderTop: "1px solid rgba(168,85,247,0.1)" }}
        >
          <p>&copy; {new Date().getFullYear()} Be Simple 75. All Rights Reserved.</p>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-1 h-1 rounded-full" style={{ background: "linear-gradient(#a855f7,#22d3ee)" }} />
            <span>Built for the bold. Delivered to Bangladesh.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
