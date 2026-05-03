import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetFeaturedProducts, useListProducts } from "@workspace/api-client-react";
import { ArrowRight, Paintbrush, Zap, Layers } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useGetFeaturedProducts();
  const [activeFilter, setActiveFilter] = useState<string>("All");
  
  const categoryFilter = activeFilter === "All" ? undefined : activeFilter;
  const { data: filteredProducts, isLoading: isLoadingFiltered } = useListProducts(
    categoryFilter ? { category: categoryFilter } : undefined
  );

  const displayProducts = activeFilter === "All" ? featuredProducts : filteredProducts;
  const isLoading = activeFilter === "All" ? isLoadingFeatured : isLoadingFiltered;

  const filters = ["All", "Anime", "Music", "Gaming", "Street"];

  return (
    <div className="flex flex-col gap-24 pb-24 bg-[#0a0a0a] text-[#f0f0f0]">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden bg-black border-b border-[#1f1f1f]">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-60 md:opacity-100 flex items-center justify-end pr-10 overflow-hidden pointer-events-none">
           <img 
              src="/products/berserk-back.jpg" 
              alt="Hero product" 
              className="w-full h-[120%] object-cover object-center translate-x-1/4 -rotate-6 scale-110 mix-blend-lighten opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
        </div>
        
        <div className="container relative z-10 px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display text-6xl md:text-8xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.85] mb-8 text-white drop-shadow-2xl">
              Wear Your <br />
              <span className="text-[#e63329]">Loudest</span> <br />
              Thoughts
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-xl mb-10 font-medium uppercase tracking-wide">
              Raw. Unfiltered. Concrete. <br /> Premium heavyweight streetwear drops.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto font-black uppercase tracking-widest text-lg h-16 px-10 bg-[#e63329] text-white hover:bg-white hover:text-black transition-colors rounded-none border-2 border-transparent">
                  Shop The Drop
                </Button>
              </Link>
              <Link href="/customize" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-black uppercase tracking-widest text-lg h-16 px-10 bg-transparent text-white border-2 border-white hover:bg-white hover:text-black transition-colors rounded-none">
                  Enter Studio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 border-b-2 border-[#1f1f1f] pb-6">
          <h2 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Latest Drops</h2>
          
          <div className="flex gap-3 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm transition-all border-2 ${
                  activeFilter === filter 
                    ? "bg-white text-black border-white" 
                    : "bg-transparent text-zinc-400 border-[#1f1f1f] hover:border-zinc-500 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/5] bg-[#111] animate-pulse border border-[#1f1f1f]" />
                <div className="h-6 bg-[#111] animate-pulse w-3/4" />
                <div className="h-6 bg-[#111] animate-pulse w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 masonry-grid">
            {displayProducts?.slice(0, 8).map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group block relative">
                <div className="aspect-[4/5] overflow-hidden bg-[#050505] mb-4 relative border-2 border-[#1f1f1f] group-hover:border-[#e63329] transition-colors duration-300">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  
                  {product.featured && (
                    <div className="absolute top-3 left-3 bg-[#e63329] text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest">
                      Hot
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <h3 className="font-bold uppercase tracking-wider truncate text-white">{product.name}</h3>
                  <p className="text-[#e63329] font-black text-lg">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link href="/products">
            <Button variant="outline" size="lg" className="font-black uppercase tracking-widest text-lg h-16 px-12 bg-transparent text-white border-2 border-[#1f1f1f] hover:border-white hover:bg-white hover:text-black transition-colors rounded-none">
              View All Products
            </Button>
          </Link>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-black py-24 border-y border-[#1f1f1f]">
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
            <div className="flex flex-col items-start space-y-6">
              <div className="h-16 w-16 bg-[#111] text-[#e63329] flex items-center justify-center rounded-none border border-[#1f1f1f]">
                <Paintbrush className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-black uppercase tracking-wider mb-3 text-white">Raw Canvas</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">Upload any design. We print it with studio-grade quality on premium heavyweight cotton.</p>
              </div>
            </div>
            <div className="flex flex-col items-start space-y-6">
              <div className="h-16 w-16 bg-[#e63329] text-white flex items-center justify-center rounded-none">
                <Layers className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-black uppercase tracking-wider mb-3 text-white">Concrete Fit</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">Oversized, boxy, heavyweight. The authentic streetwear silhouette that matches your vibe.</p>
              </div>
            </div>
            <div className="flex flex-col items-start space-y-6">
              <div className="h-16 w-16 bg-[#111] text-[#e63329] flex items-center justify-center rounded-none border border-[#1f1f1f]">
                <Zap className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-black uppercase tracking-wider mb-3 text-white">Fast Drops</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">From concept to your door in days. No more waiting for standard merch runs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
