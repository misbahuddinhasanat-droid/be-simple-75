import { useListProducts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { QuickBuyModal } from "@/components/QuickBuyModal";

interface ProductForModal {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  sizes: string[];
}

export default function Products() {
  const [category, setCategory] = useState<string | undefined>();
  const { data: products, isLoading } = useListProducts(
    category && category !== "All" ? { category } : undefined
  );
  const [quickBuyProduct, setQuickBuyProduct] = useState<ProductForModal | null>(null);

  const filters = ["All", "Anime", "Music", "Gaming", "Street"];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-[#f0f0f0]">
      <div className="container px-4 md:px-8 py-16 lg:py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b-2 border-[#1f1f1f] pb-8">
          <h1 className="font-display text-6xl md:text-8xl font-black uppercase tracking-tighter text-white leading-none">
            The <br /> Collection
          </h1>

          <div className="flex gap-3 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
            {filters.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat === "All" ? undefined : cat)}
                className={`px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm transition-all border-2 ${
                  category === cat || (cat === "All" && !category)
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
              <div key={product.id} className="group block relative">
                <div className="aspect-[4/5] overflow-hidden bg-[#050505] mb-4 relative border-2 border-[#1f1f1f] group-hover:border-[#e63329] transition-colors duration-300">
                  <Link href={`/product/${product.id}`}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                  </Link>

                  {product.featured && (
                    <div className="absolute top-3 left-3 bg-[#e63329] text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest z-10">
                      Hot
                    </div>
                  )}

                  {/* Hover action buttons */}
                  <div className="absolute bottom-0 left-0 right-0 flex gap-0 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setQuickBuyProduct({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          imageUrl: product.imageUrl,
                          sizes: product.sizes,
                        });
                      }}
                      className="flex-1 bg-[#e63329] hover:bg-white hover:text-black text-white font-black uppercase tracking-widest py-3 text-center text-[11px] transition-all flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" fill="currentColor" />
                      Buy Now
                    </button>
                    <Link
                      href={`/product/${product.id}`}
                      className="w-16 bg-black/90 hover:bg-white hover:text-black text-white font-black uppercase tracking-widest py-3 text-center text-[10px] transition-all border-l border-white/10 flex items-center justify-center"
                    >
                      View
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-1 px-1">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-bold uppercase tracking-wider truncate text-white hover:text-zinc-300 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-[#e63329] font-black text-lg">৳{product.price.toFixed(0)}</p>
                      <p className="text-zinc-600 font-bold text-sm line-through">৳999</p>
                    </div>
                    <button
                      onClick={() =>
                        setQuickBuyProduct({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          imageUrl: product.imageUrl,
                          sizes: product.sizes,
                        })
                      }
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#e63329] transition-colors flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
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

      <QuickBuyModal product={quickBuyProduct} onClose={() => setQuickBuyProduct(null)} />
    </div>
  );
}
