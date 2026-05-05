import { useListProducts } from "@/lib/api";
import { Link } from "wouter";
import { useState } from "react";
import { Zap, Star, SlidersHorizontal } from "lucide-react";
import { QuickBuyModal } from "@/components/QuickBuyModal";
import { useSEO } from "@/hooks/useSEO";

interface ProductForModal { id: number; name: string; price: number; imageUrl: string; sizes: string[]; }

export default function Products() {
  useSEO({ title: "All Streetwear — The Collection", description: "Browse all Be Simple 75 streetwear tees from ৳599 with delivery across Bangladesh.", path: "/products" });

  const [category, setCategory] = useState<string | undefined>();
  const { data: products, isLoading } = useListProducts(category && category !== "All" ? { category } : undefined);
  const [quickBuyProduct, setQuickBuyProduct] = useState<ProductForModal | null>(null);
  const filters = ["All", "Anime", "Music", "Gaming", "Street"];

  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#f5f6fa" }}>
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,23,68,0.1)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #ff1744 0%, transparent 70%)" }} />
          <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-12" style={{ background: "radial-gradient(circle, #ff4500 0%, transparent 70%)" }} />
        </div>
        <div className="container px-4 md:px-8 py-16 lg:py-20 relative z-10">
          <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: "#ff1744" }}>✦ Full Collection</p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <h1 className="font-black text-6xl md:text-8xl uppercase tracking-tighter text-white leading-none">The <span className="gradient-text">Collection</span></h1>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <SlidersHorizontal className="w-4 h-4 text-slate-500 flex-shrink-0" />
              {filters.map(cat => (
                <button key={cat} onClick={() => setCategory(cat === "All" ? undefined : cat)}
                  className="px-5 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-all duration-200 whitespace-nowrap"
                  style={category === cat || (cat === "All" && !category)
                    ? { background: "linear-gradient(135deg, #ff1744, #ff4500)", color: "white", border: "1px solid transparent" }
                    : { background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,23,68,0.15)" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/5] rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                <div className="h-4 rounded animate-pulse w-3/4" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <div key={product.id} className="group relative product-card-hover">
                <div className="aspect-[4/5] overflow-hidden mb-4 relative rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,23,68,0.08)" }}>
                  <Link href={`/product/${product.id}`}>
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 cursor-pointer" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300" />
                  </Link>
                  {product.featured && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest text-white" style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)" }}>
                      <Star className="w-2.5 h-2.5" fill="currentColor" />Hot
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 flex translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <button onClick={e => { e.preventDefault(); setQuickBuyProduct({ id: product.id, name: product.name, price: product.salePrice || product.price, originalPrice: product.salePrice ? product.price : undefined, imageUrl: product.imageUrl, sizes: product.sizes }); }}
                      className="flex-1 btn-ai py-3 flex items-center justify-center gap-1.5 rounded-none rounded-bl-xl text-[11px]">
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Zap className="w-3.5 h-3.5" fill="currentColor" />Buy Now</span>
                    </button>
                    <Link href={`/product/${product.id}`} className="w-14 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white rounded-none rounded-br-xl" style={{ background: "rgba(0,0,0,0.75)", borderLeft: "1px solid rgba(255,23,68,0.15)" }}>View</Link>
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
        ) : (
          <div className="text-center py-32 rounded-2xl" style={{ border: "1px dashed rgba(255,23,68,0.15)", background: "rgba(255,23,68,0.02)" }}>
            <h3 className="font-black text-4xl uppercase tracking-tighter mb-4 text-white">No Drops Found</h3>
            <p className="text-slate-500 mb-8">Nothing in this category yet.</p>
            <button onClick={() => setCategory(undefined)} className="btn-ai h-12 px-8 rounded-xl text-sm inline-flex items-center"><span>Clear Filters</span></button>
          </div>
        )}
      </div>
      <QuickBuyModal product={quickBuyProduct} onClose={() => setQuickBuyProduct(null)} />
    </div>
  );
}
