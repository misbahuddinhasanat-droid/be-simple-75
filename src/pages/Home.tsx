import { Link } from "wouter";
import { useGetFeaturedProducts, useListProducts } from "@/lib/api";
import { ArrowRight, Zap, Flame, ShoppingBag, Star, Heart, Smartphone } from "lucide-react";
import { useState } from "react";
import { QuickBuyModal } from "@/components/QuickBuyModal";
import { useSEO } from "@/hooks/useSEO";
import { useSettings } from "@/hooks/useSettings";

interface ProductForModal { id: number; name: string; price: number; imageUrl: string; sizes: string[]; }

export default function Home() {
  useSEO({ title: "Premium Streetwear Bangladesh", description: "Be Simple 75 — premium streetwear t-shirts from ৳599. Fast delivery Dhaka, Chittagong, Sylhet & all BD.", path: "/" });

  const { data: featuredProducts, isLoading: isLoadingFeatured } = useGetFeaturedProducts();
  const { data: settings } = useSettings();
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [quickBuyProduct, setQuickBuyProduct] = useState<ProductForModal | null>(null);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const categoryFilter = activeFilter === "All" ? undefined : activeFilter;
  const { data: filteredProducts, isLoading: isLoadingFiltered } = useListProducts(categoryFilter ? { category: categoryFilter } : undefined);
  const displayProducts = activeFilter === "All" ? featuredProducts : filteredProducts;
  const isLoading = activeFilter === "All" ? isLoadingFeatured : isLoadingFiltered;
  const filters = ["All", "Anime", "Music", "Gaming", "Street"];

  const heroTitleLines = (settings?.storeInfo?.heroTitle || "Wear\nLouder.\nLive\nBolder.").split("\n");
  const heroSubtitle = settings?.storeInfo?.heroSubtitle || "Premium streetwear that hits different. Anime · Music · Street · Gaming.";

  const toggleWishlist = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ background: "#050508", color: "#f5f6fa" }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] rounded-full blur-3xl orb-red" style={{ background: "radial-gradient(circle, rgba(255,23,68,0.22) 0%, transparent 70%)" }} />
          <div className="absolute bottom-1/4 right-1/6 w-[350px] h-[350px] rounded-full blur-3xl orb-orange" style={{ background: "radial-gradient(circle, rgba(255,69,0,0.18) 0%, transparent 70%)" }} />
          <div className="absolute top-1/2 right-1/3 w-[280px] h-[280px] rounded-full blur-3xl orb-coral" style={{ background: "radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)" }} />
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,23,68,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,23,68,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Product image */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none overflow-hidden">
          <img src="/products/berserk-back.jpg" alt="Hero" className="w-full h-full object-cover opacity-15 scale-110" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #050508 0%, rgba(5,5,8,0.4) 40%, transparent 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #050508 0%, transparent 20%, transparent 80%, #050508 100%)" }} />
        </div>

        <div className="container relative z-10 px-4 md:px-8 py-20">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest" style={{ background: "rgba(255,23,68,0.1)", border: "1px solid rgba(255,23,68,0.3)", color: "#ff1744" }}>
            <div className="w-4 h-4 rounded overflow-hidden bg-white/10 flex items-center justify-center">
              <img src="/logo.png" alt="" className="w-full h-full object-contain" />
            </div>
            New Drop 2026 — Bangladesh Exclusive
          </div>

          <h1 className="font-black text-7xl md:text-9xl lg:text-[130px] uppercase leading-[0.85] mb-8 tracking-tighter">
            {heroTitleLines.map((line, idx) => (
              <span key={idx} className={`block ${idx === 1 ? "gradient-text" : "text-white"}`}>{line}</span>
            ))}
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-lg mb-10 font-medium leading-relaxed whitespace-pre-line">
            {heroSubtitle}
            <span className="font-bold" style={{ color: "#ff4500" }}> Only ৳599.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products">
              <button className="btn-ai flex items-center justify-center gap-2.5 h-14 px-8 rounded-xl text-sm">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Zap className="w-4 h-4" fill="currentColor" />
                  Shop The Drop
                </span>
              </button>
            </Link>
            <Link href="/customize">
              <button className="btn-ai-outline flex items-center justify-center gap-2 h-14 px-8 rounded-xl text-sm">
                <div className="w-5 h-5 rounded overflow-hidden bg-white/10 flex items-center justify-center">
                  <img src="/logo.png" alt="" className="w-full h-full object-contain" />
                </div>
                Enter Studio
              </button>
            </Link>
          </div>

          <div className="flex gap-8 mt-14 pt-10" style={{ borderTop: "1px solid rgba(255,23,68,0.15)" }}>
            {[{ value: "20+", label: "Designs" }, { value: "৳599", label: "Starting" }, { value: "48h", label: "Delivery" }, { value: "BD", label: "Nationwide" }].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-black gradient-text-red-orange">{value}</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ─────────────────────────────────────────── */}
      <section className="container px-4 md:px-8 py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "#ff1744" }}>✦ Latest Releases</p>
            <h2 className="font-black text-5xl md:text-7xl uppercase tracking-tighter leading-none text-white">
              Latest <span className="gradient-text">Drops</span>
            </h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {filters.map(filter => (
              <button key={filter} onClick={() => setActiveFilter(filter)}
                className="px-5 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-all duration-200 whitespace-nowrap"
                style={activeFilter === filter
                  ? { background: "linear-gradient(135deg, #ff1744, #ff4500)", color: "white", border: "1px solid transparent" }
                  : { background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,23,68,0.15)" }
                }>
                {filter}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/5] rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                <div className="h-4 rounded animate-pulse w-3/4" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayProducts?.slice(0, 20).map(product => (
              <div key={product.id} className="group relative product-card-hover">
                <div className="aspect-[4/5] overflow-hidden mb-4 relative rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,23,68,0.1)" }}>
                  <Link href={`/product/${product.id}`}>
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 cursor-pointer" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300" />
                  </Link>
                  {product.featured && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest text-white" style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)" }}>
                      <Star className="w-2.5 h-2.5" fill="currentColor" />Hot
                    </div>
                  )}
                  <button onClick={(e) => toggleWishlist(e, product.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-black/40 hover:bg-black/70 border border-white/10 group-hover:opacity-100 opacity-0 md:opacity-100">
                    <Heart className={`w-4 h-4 ${wishlist.has(product.id) ? 'text-rose-500 fill-rose-500' : 'text-white'}`} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 flex translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <button onClick={e => { e.preventDefault(); setQuickBuyProduct({ id: product.id, name: product.name, price: product.salePrice || product.price, originalPrice: product.salePrice ? product.price : undefined, imageUrl: product.imageUrl, sizes: product.sizes }); }}
                      className="flex-1 btn-ai py-3 flex items-center justify-center gap-1.5 rounded-none rounded-bl-xl text-[11px]">
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><ShoppingBag className="w-3.5 h-3.5" />Add to Bag</span>
                    </button>
                    <Link href={`/product/${product.id}`} className="w-14 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white rounded-none rounded-br-xl" style={{ background: "rgba(0,0,0,0.7)", borderLeft: "1px solid rgba(255,23,68,0.2)" }}>View</Link>
                  </div>
                </div>
                <div className="px-1">
                  <Link href={`/product/${product.id}`}><h3 className="font-bold uppercase tracking-wide truncate text-white hover:text-red-300 transition-colors text-sm">{product.name}</h3></Link>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-baseline gap-1.5">
                      {product.salePrice ? (
                        <>
                          <p className="font-black text-base gradient-text-red-orange">৳{product.salePrice.toFixed(0)}</p>
                          <p className="text-slate-600 font-bold text-xs line-through">৳{product.price.toFixed(0)}</p>
                        </>
                      ) : (
                        <p className="font-black text-base gradient-text-red-orange">৳{product.price.toFixed(0)}</p>
                      )}
                    </div>
                    <button onClick={() => setQuickBuyProduct({ id: product.id, name: product.name, price: product.salePrice || product.price, originalPrice: product.salePrice ? product.price : undefined, imageUrl: product.imageUrl, sizes: product.sizes })} className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1">
                      <Zap className="w-3 h-3" />Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <Link href="/products">
            <button className="btn-ai-outline inline-flex items-center gap-3 h-14 px-10 rounded-xl text-sm">
              View All Products<ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="py-24" style={{ borderTop: "1px solid rgba(255,23,68,0.08)", background: "rgba(255,255,255,0.01)" }}>
        <div className="container px-4 md:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: "#ff4500" }}>Why Choose Us</p>
            <h2 className="font-black text-4xl md:text-5xl uppercase tracking-tighter text-white">Built <span className="gradient-text">Different</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Flame className="h-6 w-6 text-white" />, gradient: "linear-gradient(135deg, #ff1744, #c62828)", glow: "rgba(255,23,68,0.3)", title: "Raw Canvas", desc: "Upload any design. Studio-grade printing on premium 300gsm heavyweight cotton." },
              { icon: <ShoppingBag className="h-6 w-6 text-white" />, gradient: "linear-gradient(135deg, #ff4500, #c84b00)", glow: "rgba(255,69,0,0.3)", title: "Concrete Fit", desc: "Oversized, boxy, heavyweight. The authentic streetwear silhouette you actually want." },
              { icon: <Zap className="h-6 w-6 text-white" fill="currentColor" />, gradient: "linear-gradient(135deg, #ff6b35, #e63900)", glow: "rgba(255,107,53,0.3)", title: "One-Click Buy", desc: "Hit Buy Now. Pick your size. Go straight to checkout. No waiting. No friction." },
            ].map(({ icon, gradient, glow, title, desc }) => (
              <div key={title} className="rounded-2xl p-8 transition-all duration-300 group hover:-translate-y-1" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,23,68,0.1)" }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110" style={{ background: gradient, boxShadow: `0 8px 25px ${glow}` }}>{icon}</div>
                <h3 className="font-black text-xl uppercase tracking-wider text-white mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP DOWNLOAD ─────────────────────────────────────── */}
      <section className="py-24" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.01) 0%, transparent 100%)" }}>
        <div className="container px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 p-8 md:p-12 rounded-3xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,23,68,0.15)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white" style={{ background: "rgba(255,255,255,0.1)" }}>
                <Smartphone className="w-3.5 h-3.5" /> Be Simple 75 App
              </div>
              <h2 className="font-black text-4xl md:text-5xl uppercase tracking-tighter mb-4 text-white">Take the Studio <br/><span className="gradient-text">Anywhere</span></h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8">Scan the QR code to install our Progressive Web App (PWA) directly to your home screen. Experience faster loading, seamless ordering, and instant access to our latest drops.</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Zap className="w-4 h-4 text-rose-500" /></div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Fast</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Star className="w-4 h-4 text-rose-500" /></div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Native Feel</p>
                </div>
              </div>
            </div>
            <div className="relative p-6 rounded-2xl bg-white flex-shrink-0 group">
              <div className="absolute inset-0 rounded-2xl opacity-50 blur-xl group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)", zIndex: -1 }} />
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "https://besimple75.com")}`} alt="Download App" className="w-[160px] h-[160px] object-contain rounded-lg" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-lg p-1 shadow-xl">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" style={{ filter: "invert(1)" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,23,68,0.1) 0%, transparent 70%)" }} />
        <div className="container px-4 md:px-8 relative z-10 text-center">
          <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: "#ff1744" }}>Custom Design Studio</p>
          <h2 className="font-black text-5xl md:text-7xl uppercase tracking-tighter mb-6 text-white">Create <span className="gradient-text">Your Own</span></h2>
          <p className="text-slate-400 max-w-md mx-auto text-base mb-10 leading-relaxed">Upload your artwork. We print it on premium heavyweight tees. Your design. Your statement.</p>
          <Link href="/customize">
            <button className="btn-ai inline-flex items-center gap-2.5 h-14 px-10 rounded-xl text-sm">
              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}><Flame className="w-4 h-4" />Open Studio — Free</span>
            </button>
          </Link>
        </div>
      </section>

      <QuickBuyModal product={quickBuyProduct} onClose={() => setQuickBuyProduct(null)} />
    </div>
  );
}
