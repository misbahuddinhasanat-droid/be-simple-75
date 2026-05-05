import { Link } from "wouter";
import { useGetFeaturedProducts, useListProducts } from "@/lib/api";
import { ArrowRight, Zap, Flame, ShoppingBag, Heart, Timer, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { QuickBuyModal } from "@/components/QuickBuyModal";
import { useSEO } from "@/hooks/useSEO";
import { useSettings } from "@/hooks/useSettings";
import { motion } from "framer-motion";

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
    <div style={{ background: "#050508", color: "#f5f6fa" }} className="relative">
      
      {/* Promo marquee lives in Layout TopBar — single store-wide source */}

      {/* ── HERO (Hulu Style) ─────────────────────────────────── */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-45 scale-105 contrast-125 saturate-110"
          >
            <source src={settings?.storeInfo?.siHeroVideoUrl || "https://cdn.pixabay.com/video/2021/04/12/70860-537446340_large.mp4"} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-transparent to-transparent" />
          
          {/* Interactive Orbs */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none"
          />
        </div>

        <div className="container relative z-10 px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-3 mb-8 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
               <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">System Online — Drop 075 Ready</p>
            </div>

            <h1 className="font-black text-7xl md:text-9xl lg:text-[140px] uppercase leading-[0.8] mb-10 tracking-tighter italic text-white drop-shadow-2xl">
              {heroTitleLines.map((line, idx) => (
                <span key={idx} className="block overflow-hidden h-[1.1em]">
                  <motion.span 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`block ${idx === 1 ? "text-rose-500" : "text-white"}`}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-slate-400 text-lg md:text-xl max-w-xl mb-12 font-bold uppercase tracking-wider leading-relaxed"
            >
              {heroSubtitle} <span className="text-white">Starting from ৳599.</span>
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/products">
                <button className="btn-ai h-16 px-12 rounded-2xl text-xs flex items-center justify-center gap-3 shadow-2xl shadow-rose-600/20 group">
                  <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" fill="currentColor" />
                  Access Collection
                </button>
              </Link>
              <Link href="/customize">
                <button className="h-16 px-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all">
                  Open Studio
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50">
           <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Scroll Down</p>
        </div>
      </section>

      {/* ── PRODUCT FEED ─────────────────────────────────────── */}
      <section className="container px-4 md:px-8 py-20 md:py-32 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest mb-4">
               <Flame className="w-3.5 h-3.5" fill="currentColor" /> Live Feed
            </div>
            <h2 className="font-black text-6xl md:text-8xl uppercase tracking-tighter leading-none text-white italic">
              Latest <span className="text-rose-600">Drops</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md overflow-x-auto hide-scrollbar max-w-full">
            {filters.map(filter => (
              <button 
                key={filter} 
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all duration-300 whitespace-nowrap ${
                  activeFilter === filter 
                  ? "bg-white text-black shadow-xl" 
                  : "text-slate-500 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-[3/4] bg-white/5 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
            {displayProducts?.slice(0, 20).map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group relative"
              >
                <div className="aspect-[3/4] overflow-hidden mb-6 relative rounded-[2.5rem] bg-white/2 border border-white/5 hover:border-rose-500/30 transition-all duration-500 glass-dark">
                  <Link href={`/product/${product.id}`}>
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  </Link>
                  
                  {/* Badge */}
                  {product.featured && (
                    <div className="pointer-events-none absolute top-5 left-5 bg-rose-600 text-white text-[8px] font-black px-3 py-1.5 rounded-lg shadow-xl uppercase tracking-widest">
                       Priority Drop
                    </div>
                  )}

                  {/* Actions Overlay — always usable on touch; hover lift on desktop */}
                  <div className="absolute inset-x-6 bottom-6 flex flex-col gap-3 translate-y-0 opacity-100 md:translate-y-8 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500">
                    <button 
                      onClick={() => setQuickBuyProduct({ id: product.id, name: product.name, price: product.salePrice || product.price, imageUrl: product.imageUrl, sizes: product.sizes })}
                      className="w-full h-12 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-colors shadow-2xl"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Instant Add
                    </button>
                  </div>

                  <button onClick={(e) => toggleWishlist(e, product.id)} className="absolute top-5 right-5 w-10 h-10 rounded-xl flex items-center justify-center bg-black/20 backdrop-blur-md border border-white/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                    <Heart className={`w-4 h-4 ${wishlist.has(product.id) ? 'text-rose-500 fill-rose-500' : 'text-white'}`} />
                  </button>
                </div>

                <div className="px-2">
                   <div className="flex justify-between items-start mb-2">
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-black uppercase tracking-tight text-lg text-white italic group-hover:text-rose-500 transition-colors truncate max-w-[70%]">{product.name}</h3>
                      </Link>
                      <div className="text-right">
                         <p className="font-black text-xl text-white italic leading-none">৳{(product.salePrice || product.price).toFixed(0)}</p>
                         {product.salePrice && <p className="text-[10px] font-black text-slate-700 line-through mt-1">৳{product.price.toFixed(0)}</p>}
                      </div>
                   </div>
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Unit ID: 075-PR-{product.id}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── TRUST & FEATURES ──────────────────────────────────── */}
      <section className="py-20 md:py-32 border-y border-white/5 bg-white/2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 blur-[100px] pointer-events-none" />
        <div className="container px-4 md:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
              {[
                { icon: <ShieldCheck className="w-8 h-8 text-rose-500" />, title: "Secure Drop", desc: "Every unit undergoes a 12-point quality manifest before uplinking to your address." },
                { icon: <Timer className="w-8 h-8 text-rose-500" />, title: "Mach 1 Speed", desc: "Inside Dhaka in 24h. Nationwide in 72h. Faster than a server heartbeat." },
                { icon: <Zap className="w-8 h-8 text-rose-500" />, title: "Elite Cotton", desc: "300GSM Heavyweight cotton. Built to endure high-intensity wear and manifest." },
              ].map((f, i) => (
                <div key={i} className="space-y-6">
                   <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">{f.icon}</div>
                   <h3 className="font-black text-2xl uppercase tracking-tighter text-white italic">{f.title}</h3>
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">{f.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 md:py-40 relative overflow-hidden">
        <div className="container px-4 md:px-8 text-center relative z-10">
           <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.5em] mb-8">Studio Integration</p>
           <h2 className="font-black text-7xl md:text-9xl uppercase tracking-tighter text-white italic leading-[0.8] mb-12">
             Design Your<br />Own Reality.
           </h2>
           <Link href="/customize">
              <button className="btn-ai h-20 px-16 rounded-[2rem] text-sm group">
                 Launch Studio <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
           </Link>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(225,29,72,0.1),transparent_70%)] pointer-events-none" />
      </section>

      <QuickBuyModal product={quickBuyProduct} onClose={() => setQuickBuyProduct(null)} />
    </div>
  );
}
