import { useState, useEffect } from "react";
import { X, Zap } from "lucide-react";
import { useBuyNow } from "@/hooks/useBuyNow";
import { useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface QuickBuyProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  sizes: string[];
}

interface QuickBuyModalProps {
  product: QuickBuyProduct | null;
  onClose: () => void;
}

export function QuickBuyModal({ product, onClose }: QuickBuyModalProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const { buyNow, isPending: isBuyingNow } = useBuyNow();
  const addCartItem = useAddCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (product?.sizes?.length) {
      const defaultSize = product.sizes.includes("XL") ? "XL" : product.sizes[0];
      setSelectedSize(defaultSize);
      setSizeError(false);
    }
  }, [product]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!product) return null;

  const handleBuyNow = () => {
    if (!selectedSize) { setSizeError(true); return; }
    buyNow(product.id, selectedSize);
  };

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    addCartItem.mutate(
      { data: { productId: product.id, size: selectedSize, color: "Black", quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Added to Bag", description: `${product.name} (${selectedSize}) added.` });
          onClose();
        },
        onError: () => {
          toast({ title: "Error", description: "Could not add to bag.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-lg bg-[#0d0d0d] border-t-2 sm:border-2 border-[#1f1f1f] animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300">
        {/* Header */}
        <div className="flex items-start gap-4 p-5 border-b border-[#1f1f1f]">
          <div className="w-20 h-20 flex-shrink-0 bg-[#111] border border-[#1f1f1f] overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-top" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className="font-black uppercase tracking-wide text-white text-sm leading-tight line-clamp-2">{product.name}</p>
            <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-[#e63329] font-black text-xl">৳{product.price.toFixed(0)}</p>
                    <p className="text-zinc-600 font-bold text-sm line-through">৳999</p>
                  </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5">Heavyweight Black · Free Shipping</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Size Picker */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Select Size {selectedSize && <span className="text-white">— {selectedSize}</span>}
            </p>
            {sizeError && (
              <p className="text-[10px] font-black uppercase tracking-widest text-[#e63329]">Please pick a size</p>
            )}
          </div>

          <div className="grid grid-cols-6 gap-2 mb-5">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => { setSelectedSize(size); setSizeError(false); }}
                className={`h-11 border-2 font-black text-xs transition-all ${
                  selectedSize === size
                    ? "border-white bg-white text-black"
                    : sizeError
                    ? "border-[#e63329]/50 text-zinc-400 hover:border-zinc-400 hover:text-white"
                    : "border-[#1f1f1f] text-zinc-400 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* CTAs */}
          <button
            onClick={handleBuyNow}
            disabled={isBuyingNow}
            className="w-full h-14 bg-[#e63329] hover:bg-white hover:text-black text-white font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 mb-2"
          >
            {isBuyingNow ? (
              <span>Processing...</span>
            ) : (
              <>
                <Zap className="w-4 h-4" fill="currentColor" />
                Buy Now — ৳{product.price.toFixed(0)}
              </>
            )}
          </button>

          <button
            onClick={handleAddToCart}
            disabled={addCartItem.isPending}
            className="w-full h-11 border-2 border-[#1f1f1f] hover:border-white text-zinc-400 hover:text-white font-black uppercase tracking-widest text-xs transition-all disabled:opacity-60"
          >
            {addCartItem.isPending ? "Adding..." : "Add to Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
