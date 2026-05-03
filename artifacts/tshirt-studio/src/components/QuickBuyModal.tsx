import { useState, useEffect } from "react";
import { X, Zap, ShoppingBag } from "lucide-react";
import { useBuyNow } from "@/hooks/useBuyNow";
import { useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface QuickBuyProduct { id: number; name: string; price: number; imageUrl: string; sizes: string[]; }
interface QuickBuyModalProps { product: QuickBuyProduct | null; onClose: () => void; }

export function QuickBuyModal({ product, onClose }: QuickBuyModalProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const { buyNow, isPending: isBuyingNow } = useBuyNow();
  const addCartItem = useAddCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (product?.sizes?.length) { setSelectedSize(product.sizes.includes("XL") ? "XL" : product.sizes[0]); setSizeError(false); }
  }, [product]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!product) return null;

  const handleBuyNow = () => { if (!selectedSize) { setSizeError(true); return; } buyNow(product.id, selectedSize); };
  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    addCartItem.mutate(
      { data: { productId: product.id, size: selectedSize, color: "Black", quantity: 1 } },
      { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }); toast({ title: "Added to Bag", description: `${product.name} (${selectedSize}) added.` }); onClose(); }, onError: () => { toast({ title: "Error", description: "Could not add to bag.", variant: "destructive" }); } }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300 overflow-hidden"
        style={{ background: "rgba(6,6,10,0.98)", border: "1px solid rgba(255,23,68,0.2)", boxShadow: "0 0 60px rgba(255,23,68,0.12)" }}>
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #ff1744, #ff4500, #ff6b35)" }} />

        <div className="flex items-start gap-4 p-5" style={{ borderBottom: "1px solid rgba(255,23,68,0.1)" }}>
          <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,23,68,0.2)" }}>
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-top" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className="font-black uppercase tracking-wide text-white text-sm leading-tight line-clamp-2">{product.name}</p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <p className="font-black text-xl gradient-text-red-orange">৳{product.price.toFixed(0)}</p>
              <p className="text-slate-600 font-bold text-sm line-through">৳999</p>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest text-white" style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)" }}>40% OFF</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-0.5">Free Shipping · 300gsm Cotton</p>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors p-1 flex-shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Size {selectedSize && <span style={{ color: "#ff1744" }}>— {selectedSize}</span>}</p>
            {sizeError && <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#ff1744" }}>Pick a size</p>}
          </div>

          <div className="grid grid-cols-6 gap-2 mb-5">
            {product.sizes.map(size => (
              <button key={size} onClick={() => { setSelectedSize(size); setSizeError(false); }}
                className="h-11 rounded-lg font-black text-xs transition-all duration-200"
                style={selectedSize === size
                  ? { background: "linear-gradient(135deg, #ff1744, #ff4500)", color: "white", border: "1px solid transparent", boxShadow: "0 0 15px rgba(255,23,68,0.4)" }
                  : sizeError
                  ? { background: "rgba(255,23,68,0.05)", color: "#94a3b8", border: "1px solid rgba(255,23,68,0.3)" }
                  : { background: "rgba(255,255,255,0.03)", color: "#64748b", border: "1px solid rgba(255,23,68,0.12)" }}>
                {size}
              </button>
            ))}
          </div>

          <button onClick={handleBuyNow} disabled={isBuyingNow} className="btn-ai w-full flex items-center justify-center gap-2 disabled:opacity-60 rounded-xl mb-2.5" style={{ height: "52px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isBuyingNow ? "Processing..." : <><Zap className="w-4 h-4" fill="currentColor" />Buy Now — ৳{product.price.toFixed(0)}</>}
            </span>
          </button>
          <button onClick={handleAddToCart} disabled={addCartItem.isPending} className="btn-ai-outline w-full flex items-center justify-center gap-2 disabled:opacity-60 rounded-xl" style={{ height: "44px" }}>
            <ShoppingBag className="w-4 h-4" />{addCartItem.isPending ? "Adding..." : "Add to Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
