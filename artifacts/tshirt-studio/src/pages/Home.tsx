import { Link } from "wouter";
import { useGetFeaturedProducts, useListProducts } from "@workspace/api-client-react";
import { ArrowRight, Zap, Sparkles, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { QuickBuyModal } from "@/components/QuickBuyModal";
import { useSEO } from "@/hooks/useSEO";

interface ProductForModal {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  sizes: string[];
}

export default function Home() {
  useSEO({
    title: "Premium Streetwear Bangladesh",
    description: "Be Simple 75 — premium streetwear t-shirts in Bangladesh. Anime, graphic & oversized tees from ৳599. Fast delivery to Dhaka, Chittagong, Sylhet & all BD.",
    path: "/",
  });

  const { data: featuredProducts, isLoading: isLoadingFeatured } = useGetFeaturedProducts();
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [quickBuyProduct, setQuickBuyProduct] = useState<ProductForModal | null>(null);

  const categoryFilter = activeFilter === "All" ? undefined : activeFilter;
  const { data: filteredProducts, isLoading: isLoadingFiltered } = useListProducts(
    categoryFilter ? { category: categoryFilter } : undefined
  );

  const displayProducts = activeFilter === "All" ? featuredProducts : filteredProducts;
  const isLoading = activeFilter === "All" ? isLoadingFeatured : isLoadingFiltered;

  const filters = ["All", "Anime", "Music", "Gaming", "Street"];

  return (
    <div className="flex flex-col" style={{ background: "#05050f", color: "#f5f6fa" }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/6 w-[500px] h-[500px] rounded-full blur-3xl orb-purple"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-1/4 right-1/6 w-[400px] h-[400px] rounded-full blur-3xl orb-cyan"
            style={{ background: "radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)" }}
          />
          <div
            className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full blur-3xl orb-pink"
            style={{ background: "radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%)" }}
          />
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(168,85,247,1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />

        {/* Product image right side */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none overflow-hidden">
          <img
            src="/products/berserk-back.jpg"
            alt="Hero product"
            className="w-full h-full object-cover object-center opacity-20 mix-blend-luminosity scale-110"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #05050f 0%, rgba(5,5,15,0.5) 40%, transparent 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #05050f 0%, transparent 20%, transparent 80%, #05050f 100%)" }} />
        </div>

        {/* Hero content */}
        <div className="container relative z-10 px-4 md:px-8 py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7" }}>
            <Sparkles className="w-3.5 h-3.5" />
            New Drop 2026 — Bangladesh Exclusive
          </div>

          <h1 className="font-black text-7xl md:text-9xl lg:text-[140px] uppercase leading-[0.85] mb-8 tracking-tighter">
            <span className="block text-white">Wear</span>
            <span className="block gradient-text">Louder.</span>
            <span className="block text-white">Live</span>
            <span className="block text-white">Bolder.</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-lg mb-10 font-medium leading-relaxed">
            Premium streetwear that hits different. 
            Anime · Music · Street · Gaming.
            <span className="gradient-text-cyan-pink font-bold"> Only ৳599.</span>
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
                <Sparkles className="w-4 h-4" />
                Enter Studio
              </button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-14 pt-10" style={{ borderTop: "1px solid rgba(168,85,247,0.15)" }}>
            {[
              { value: "20+", label: "Designs" },
              { value: "৳599", label: "Starting Price" },
              { value: "48h", label: "Delivery" },
              { value: "BD", label: "Nationwide" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-black gradient-text-purple-cyan">{value}</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ─────────────────────────────────────────────── */}
      <section className="container px-4 md:px-8 py-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "#a855f7" }}>
              ✦ Latest Releases
            </p>
            <h2 className="font-black text-5xl md:text-7xl uppercase tracking-tighter leading-none text-white">
              Latest <span className="gradient-text">Drops</span>
            </h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className="px-5 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-all duration-200 whitespace-nowrap"
                style={
                  activeFilter === filter
                    ? { background: "linear-gradient(135deg, #a855f7, #22d3ee)", color: "white", border: "1px solid transparent" }
                    : { background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(168,85,247,0.2)" }
                }
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/5] rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                <div className="h-4 rounded animate-pulse w-3/4" style={{ background: "rgba(255,255,255,0.04)" }} />
                <div className="h-4 rounded animate-pulse w-1/3" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayProducts?.slice(0, 8).map((product) => (
              <div key={product.id} className="group relative product-card-hover">
                {/* Image wrapper */}
                <div
                  className="aspect-[4/5] overflow-hidden mb-4 relative rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.12)" }}
                >
                  <Link href={`/product/${product.id}`}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  </Link>

                  {product.featured && (
                    <div
                      className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest text-white"
                      style={{ background: "linear-gradient(135deg, #a855f7, #22d3ee)" }}
                    >
                      <Star className="w-2.5 h-2.5" fill="currentColor" />
                      Hot
                    </div>
                  )}

                  {/* Hover overlay CTAs */}
                  <div className="absolute bottom-0 left-0 right-0 flex translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setQuickBuyProduct({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, sizes: product.sizes });
                      }}
                      className="flex-1 btn-ai py-3 text-center text-[11px] flex items-center justify-center gap-1.5 rounded-none rounded-bl-xl"
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Zap className="w-3.5 h-3.5" fill="currentColor" />
                        Buy Now
                      </span>
                    </button>
                    <Link
                      href={`/product/${product.id}`}
                      className="w-14 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white transition-all rounded-none rounded-br-xl"
                      style={{ background: "rgba(0,0,0,0.7)", borderLeft: "1px solid rgba(168,85,247,0.2)" }}
                    >
                      View
                    </Link>
                  </div>
                </div>

                <div className="px-1">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-bold uppercase tracking-wide truncate text-white hover:text-purple-300 transition-colors text-sm">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-baseline gap-1.5">
                      <p className="font-black text-base gradient-text-purple-cyan">৳{product.price.toFixed(0)}</p>
                      <p className="text-slate-600 font-bold text-xs line-through">৳999</p>
                    </div>
                    <button
                      onClick={() => setQuickBuyProduct({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, sizes: product.sizes })}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-purple-400 transition-colors flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View all */}
        <div className="mt-14 text-center">
          <Link href="/products">
            <button
              className="btn-ai-outline inline-flex items-center gap-3 h-14 px-10 rounded-xl text-sm"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="py-24" style={{ borderTop: "1px solid rgba(168,85,247,0.1)", borderBottom: "1px solid rgba(168,85,247,0.1)", background: "rgba(255,255,255,0.01)" }}>
        <div className="container px-4 md:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: "#22d3ee" }}>Why Choose Us</p>
            <h2 className="font-black text-4xl md:text-5xl uppercase tracking-tighter text-white">
              Built <span className="gradient-text">Different</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Sparkles className="h-6 w-6 text-white" />,
                gradient: "linear-gradient(135deg, #a855f7, #7c3aed)",
                glow: "rgba(168,85,247,0.3)",
                title: "Raw Canvas",
                desc: "Upload any design. Studio-grade printing on premium 300gsm heavyweight cotton.",
              },
              {
                icon: <ShoppingBag className="h-6 w-6 text-white" />,
                gradient: "linear-gradient(135deg, #22d3ee, #06b6d4)",
                glow: "rgba(34,211,238,0.3)",
                title: "Concrete Fit",
                desc: "Oversized, boxy, heavyweight. The authentic streetwear silhouette you actually want.",
              },
              {
                icon: <Zap className="h-6 w-6 text-white" fill="currentColor" />,
                gradient: "linear-gradient(135deg, #f472b6, #ec4899)",
                glow: "rgba(244,114,182,0.3)",
                title: "One-Click Buy",
                desc: "Hit Buy Now. Pick your size. Go straight to checkout. No waiting. No friction.",
              },
            ].map(({ icon, gradient, glow, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-8 transition-all duration-300 group hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(168,85,247,0.12)" }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                  style={{ background: gradient, boxShadow: `0 8px 25px ${glow}` }}
                >
                  {icon}
                </div>
                <h3 className="font-black text-xl uppercase tracking-wider text-white mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, rgba(168,85,247,0.12) 0%, transparent 70%)" }}
          />
        </div>
        <div className="container px-4 md:px-8 relative z-10 text-center">
          <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: "#a855f7" }}>Custom Design Studio</p>
          <h2 className="font-black text-5xl md:text-7xl uppercase tracking-tighter mb-6 text-white">
            Create <span className="gradient-text">Your Own</span>
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-base mb-10 leading-relaxed">
            Upload your artwork. We print it on premium heavyweight tees. Your design. Your statement.
          </p>
          <Link href="/customize">
            <button className="btn-ai inline-flex items-center gap-2.5 h-14 px-10 rounded-xl text-sm">
              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Sparkles className="w-4 h-4" />
                Open Studio — Free
              </span>
            </button>
          </Link>
        </div>
      </section>

      <QuickBuyModal product={quickBuyProduct} onClose={() => setQuickBuyProduct(null)} />
    </div>
  );
}
