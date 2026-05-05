import { Link } from "wouter";
import { Heart, ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Wishlist() {
  const wishlistItems: never[] = [];

  return (
    <div className="min-h-screen pt-32 pb-20" style={{ background: "#050508" }}>
      <div className="container px-4 md:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">My Wishlist</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Saved for your next drop</p>
          </div>
          <Link href="/products">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </button>
          </Link>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white/5 border border-dashed border-white/10">
            <Heart className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your wishlist is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((product) => (
              <motion.div
                key={product.id}
                layout
                className="group relative rounded-3xl overflow-hidden bg-[#0f172a]/40 border border-white/5"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-6">
                  <h3 className="text-sm font-black uppercase text-white mb-2">{product.name}</h3>
                  <p className="text-rose-500 font-black mb-6">৳{product.price}</p>
                  <div className="flex gap-2">
                    <Link href={`/product/${product.id}`} className="flex-1">
                      <button className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white" style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)" }}>
                        View Details
                      </button>
                    </Link>
                    <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
