import { useGetCart, useRemoveCartItem, getGetCartQueryKey } from "@/lib/api";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, ArrowRight } from "lucide-react";

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
      <div className="bg-[#0a0a0a] min-h-screen text-[#f0f0f0]">
        <div className="container px-4 py-16 max-w-4xl mx-auto">
          <h1 className="font-display text-5xl font-black uppercase tracking-tighter mb-12 text-white border-b-2 border-[#1f1f1f] pb-6">Shopping Bag</h1>
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="h-40 bg-[#111] animate-pulse border border-[#1f1f1f]"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen text-[#f0f0f0]">
        <div className="container px-4 py-32 max-w-3xl mx-auto text-center border-2 border-dashed border-[#1f1f1f] bg-[#050505] my-16">
          <h1 className="font-display text-5xl font-black uppercase tracking-tighter mb-6 text-white">Bag is Empty</h1>
          <p className="text-zinc-400 font-bold uppercase tracking-wider mb-12 text-lg">Nothing to see here. Time to cop some gear.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto font-black uppercase tracking-widest h-16 px-10 bg-[#e63329] text-white hover:bg-white hover:text-black rounded-none">Shop Collection</Button>
            </Link>
            <Link href="/customize">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-black uppercase tracking-widest h-16 px-10 bg-transparent text-white border-2 border-white hover:bg-white hover:text-black rounded-none">Open Studio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-[#f0f0f0] pb-24">
      <div className="container px-4 py-16 max-w-6xl mx-auto">
        <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter mb-12 border-b-2 border-[#1f1f1f] pb-6 text-white">Shopping Bag</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {cart.items.map((item) => (
              <div key={item.itemId} className="flex gap-6 p-6 border-2 border-[#1f1f1f] bg-[#050505] group hover:border-zinc-700 transition-colors">
                <div className="w-28 md:w-40 aspect-[4/5] bg-[#111] overflow-hidden relative shrink-0">
                  <img 
                    src={item.productImageUrl} 
                    alt={item.productName} 
                    className="w-full h-full object-cover object-top"
                  />
                  {item.customDesignUrl && (
                    <div className="absolute inset-0 flex items-center justify-center p-2 mt-4 bg-black/40">
                      <img src={item.customDesignUrl} alt="Custom design" className="w-2/3 object-contain" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-black uppercase tracking-wide text-xl text-white leading-tight mb-2">{item.productName}</h3>
                      {item.customDesignUrl && (
                        <span className="text-[10px] font-black bg-[#e63329]/20 text-[#e63329] px-2 py-1 uppercase tracking-widest border border-[#e63329]/50">Custom Drop</span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-[#e63329] whitespace-nowrap">৳{item.price.toFixed(0)}</p>
                      <p className="text-zinc-600 font-bold text-sm line-through">৳999</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-zinc-400 space-y-2 font-bold uppercase tracking-wider">
                    <p>Color: <span className="text-white">Heavyweight Black</span></p>
                    <p>Size: <span className="text-white">{item.size}</span></p>
                    <p>Qty: <span className="text-white">{item.quantity}</span></p>
                  </div>

                  <div className="mt-auto pt-6 flex justify-between items-center border-t border-[#1f1f1f]">
                    <button 
                      onClick={() => handleRemove(item.itemId)}
                      disabled={removeCartItem.isPending}
                      className="text-xs font-black uppercase tracking-widest text-[#e63329] flex items-center gap-2 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-[#050505] border-2 border-[#1f1f1f] p-8 sticky top-28">
              <h2 className="font-display text-3xl font-black uppercase tracking-tight mb-8 text-white">Summary</h2>
              
              <div className="space-y-4 text-sm mb-8 pb-8 border-b-2 border-[#1f1f1f] font-bold uppercase tracking-wider">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal ({cart.itemCount} items)</span>
                  <span className="text-white">৳{cart.total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>
                  <span className="text-[#e63329]">Free Drop</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Taxes</span>
                  <span>Calculated later</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-10">
                <span className="font-black uppercase tracking-widest text-zinc-400">Total</span>
                <span className="font-display text-4xl font-black text-white">৳{cart.total.toFixed(0)}</span>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button size="lg" className="w-full h-16 font-black uppercase tracking-widest text-lg bg-[#e63329] hover:bg-white hover:text-black text-white transition-colors rounded-none">
                  Secure Checkout <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
