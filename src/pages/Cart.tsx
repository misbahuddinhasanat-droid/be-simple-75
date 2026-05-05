import { useGetCart, useRemoveCartItem, getGetCartQueryKey } from "@/lib/cart-store";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, ArrowRight, ShoppingBag, Zap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const removeCartItem = useRemoveCartItem();
  const queryClient = useQueryClient();

  const handleRemove = (itemId: string) => {
    removeCartItem.mutate({ itemId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="bg-[#050508] min-h-screen text-[#f0f0f0]">
        <div className="container px-6 py-20 max-w-4xl mx-auto">
          <div className="h-12 w-64 bg-white/5 animate-pulse rounded-lg mb-12"></div>
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-white/2 animate-pulse border border-white/5 rounded-[2rem]"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-[#050508] min-h-screen text-[#f0f0f0] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full text-center border border-white/5 bg-white/2 p-12 md:p-20 rounded-[3rem] glass-dark relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
          <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-10">
             <ShoppingBag className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="font-black text-5xl md:text-6xl uppercase tracking-tighter mb-6 text-white italic leading-none">Bag is Empty.</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] mb-12 text-xs">Nothing currently manifesting. Ready for your next drop?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="w-full sm:w-auto">
              <button className="w-full btn-ai h-16 px-10 rounded-2xl">Shop Drops</button>
            </Link>
            <Link href="/customize" className="w-full sm:w-auto">
              <button className="w-full h-16 px-10 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all rounded-2xl">Open Studio</button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#050508] min-h-screen text-[#f0f0f0] pb-32">
      <div className="container px-6 py-20 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16 border-b border-white/5 pb-10">
           <div>
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Inventory Checkout</p>
              <h1 className="font-black text-6xl md:text-8xl uppercase tracking-tighter text-white italic leading-[0.8]">Shopping<br />Bag</h1>
           </div>
           <div className="hidden md:block text-right">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Manifest Capacity</p>
              <p className="text-white text-2xl font-black italic">{cart.itemCount} Units Active</p>
           </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {cart.items.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item.itemId} 
                    className="flex gap-8 p-8 rounded-[2.5rem] bg-white/2 border border-white/5 hover:border-rose-500/20 transition-all duration-500 relative overflow-hidden group glass-dark"
                  >
                    <div className="w-32 md:w-48 aspect-[3/4] rounded-2xl bg-black border border-white/10 overflow-hidden relative shrink-0 shadow-2xl">
                      <img 
                        src={item.productImageUrl} 
                        alt={item.productName} 
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                      />
                      {item.customDesignUrl && (
                        <div className="absolute inset-0 flex items-center justify-center p-3 mt-4 bg-black/40 backdrop-blur-[2px]">
                          <img src={item.customDesignUrl} alt="Custom design" className="w-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-black uppercase tracking-tight text-xl md:text-2xl text-white italic leading-tight mb-2 group-hover:text-rose-500 transition-colors">{item.productName}</h3>
                          {item.customDesignUrl && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[8px] font-black uppercase tracking-widest">
                               <Zap className="w-3 h-3" fill="currentColor" /> Studio Drop
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-black text-2xl text-white italic leading-none">৳{item.price.toFixed(0)}</p>
                          <p className="text-slate-600 font-bold text-[10px] line-through mt-2 tracking-widest">৳1850</p>
                        </div>
                      </div>
                      
                      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                         <div>
                            <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mb-1">Variant</p>
                            <p className="text-white text-[11px] font-black uppercase tracking-wider">Heavyweight Black</p>
                         </div>
                         <div>
                            <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mb-1">Dimensions</p>
                            <p className="text-white text-[11px] font-black uppercase tracking-wider">Size {item.size}</p>
                         </div>
                         <div className="hidden md:block">
                            <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mb-1">Batch Qty</p>
                            <p className="text-white text-[11px] font-black uppercase tracking-wider">{item.quantity} Units</p>
                         </div>
                      </div>

                      <div className="mt-8 flex justify-between items-center">
                        <button 
                          onClick={() => handleRemove(item.itemId)}
                          disabled={removeCartItem.isPending}
                          className="group/btn text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3 hover:text-rose-500 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/btn:bg-rose-500/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> 
                          </div>
                          Remove Unit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <div className="rounded-[3rem] bg-white/2 border border-white/5 p-10 md:p-12 sticky top-32 glass-dark overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl pointer-events-none" />
              <h2 className="font-black text-3xl md:text-4xl uppercase tracking-tighter mb-10 text-white italic">Summary</h2>
              
              <div className="space-y-6 text-[10px] mb-12 pb-10 border-b border-white/5 font-black uppercase tracking-[0.2em]">
                <div className="flex justify-between text-slate-500">
                  <span>Gross Value ({cart.itemCount} items)</span>
                  <span className="text-white">৳{cart.total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Logistics</span>
                  <span className="text-rose-500">Priority Drop (Free)</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Verification</span>
                  <span className="text-white">Included</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-12">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-1">Final Valuation</p>
                   <span className="font-black uppercase tracking-widest text-slate-400">Total</span>
                </div>
                <span className="font-black text-5xl text-white italic tracking-tighter">৳{cart.total.toFixed(0)}</span>
              </div>

              <div className="space-y-4">
                <Link href="/checkout" className="block w-full">
                  <button className="w-full h-20 btn-ai text-xs rounded-2xl flex items-center justify-center gap-4">
                    Secure Checkout <ArrowRight className="w-6 h-6" />
                  </button>
                </Link>
                <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
                   <ShieldCheck className="w-4 h-4" /> End-to-End Encrypted Payload
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
