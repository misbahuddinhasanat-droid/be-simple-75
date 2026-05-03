import { useListProducts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Products() {
  const [category, setCategory] = useState<string | undefined>();
  const { data: products, isLoading } = useListProducts(category && category !== 'All' ? { category } : undefined);

  const filters = ["All", "Anime", "Music", "Gaming", "Street"];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-[#f0f0f0]">
      <div className="container px-4 md:px-8 py-16 lg:py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b-2 border-[#1f1f1f] pb-8">
          <h1 className="font-display text-6xl md:text-8xl font-black uppercase tracking-tighter text-white leading-none">The <br/> Collection</h1>
          
          <div className="flex gap-3 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
            {filters.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat === "All" ? undefined : cat)}
                className={`px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm transition-all border-2 ${
                  (category === cat || (cat === "All" && !category))
                    ? "bg-white text-black border-white" 
                    : "bg-transparent text-zinc-400 border-[#1f1f1f] hover:border-zinc-500 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/5] bg-[#111] animate-pulse border border-[#1f1f1f]" />
                <div className="h-6 bg-[#111] animate-pulse w-3/4" />
                <div className="h-6 bg-[#111] animate-pulse w-1/4" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {products.map((product) => (
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
                  
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-full bg-white text-black font-black uppercase tracking-widest py-3 text-center text-sm">
                      View Detail
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <h3 className="font-bold uppercase tracking-wider truncate text-white">{product.name}</h3>
                  <p className="text-[#e63329] font-black text-lg">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-[#1f1f1f] bg-[#050505]">
            <h3 className="font-display text-4xl font-black uppercase mb-4 text-white">Dead End</h3>
            <p className="text-zinc-400 font-medium mb-8 text-lg">No drops found in this category.</p>
            <Button 
              onClick={() => setCategory(undefined)}
              className="font-black uppercase tracking-widest h-14 px-8 bg-white text-black hover:bg-zinc-200 rounded-none"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
