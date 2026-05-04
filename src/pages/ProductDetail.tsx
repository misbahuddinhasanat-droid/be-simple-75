import { useGetProduct, useAddCartItem, getGetCartQueryKey } from "@/lib/api";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Paintbrush, Minus, Plus, Zap, ShoppingBag, ArrowLeft, Flame } from "lucide-react";
import { useBuyNow } from "@/hooks/useBuyNow";
import { useSEO } from "@/hooks/useSEO";

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading, error } = useGetProduct(Number(id), { query: { enabled: !!id, queryKey: [`/api/products/${id}`] } });
  const addCartItem = useAddCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { buyNow, isPending: isBuyingNow } = useBuyNow();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  useSEO(product ? {
    title: `${product.name} — ৳${product.price.toFixed(0)} Streetwear Tee`,
    description: `${product.name} — Be Simple 75. Only ৳${product.price.toFixed(0)}. Fast delivery all over Bangladesh.`,
    path: `/product/${id}`,
    type: "product",
    product: { name: product.name, image: product.imageUrl, description: product.description ?? "", price: product.price },
  } : { title: "Product", path: `/product/${id}` });

  if (isLoading) return (
    <div style={{ background: "#050508", minHeight: "100vh" }}>
      <div className="container px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-[4/5] rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
        <div className="space-y-6 py-8">
          <div className="h-14 rounded-xl animate-pulse w-3/4" style={{ background: "rgba(255,255,255,0.04)" }} />
          <div className="h-10 rounded-xl animate-pulse w-1/4" style={{ background: "rgba(255,255,255,0.04)" }} />
        </div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div style={{ background: "#050508", minHeight: "100vh" }} className="flex items-center justify-center">
      <div className="text-center">
        <h2 className="font-black text-5xl uppercase text-white mb-6">404 — Not Found</h2>
        <Link href="/products"><button className="btn-ai h-14 px-10 rounded-xl text-sm inline-flex items-center gap-2"><span>Back to Collection</span></button></Link>
      </div>
    </div>
  );

  if (!selectedSize && product.sizes.length > 0) setSelectedSize(product.sizes[0]);
  const validateSize = () => { if (!selectedSize) { setSizeError(true); return false; } return true; };
  const handleAddToCart = () => {
    if (!validateSize()) return;
    addCartItem.mutate({ data: { productId: product.id, size: selectedSize, color: "Black", quantity } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }); toast({ title: "Added to Bag", description: `${quantity}× ${product.name} added.` }); },
      onError: () => toast({ title: "Error", description: "Could not add to bag.", variant: "destructive" }),
    });
  };
  const handleBuyNow = () => { if (!validateSize()) return; buyNow(product.id, selectedSize, "Black", quantity); };

  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#f5f6fa" }} className="pb-24">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(255,23,68,0.07) 0%, transparent 70%)" }} />
      </div>

      <div className="container px-4 md:px-8 py-10 relative z-10">
        <Link href="/products" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors mb-10 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />Back to Collection
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          <div className="aspect-[4/5] overflow-hidden sticky top-24 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,23,68,0.12)" }}>
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-top" />
          </div>

          <div className="flex flex-col py-2 md:py-8">
            <div className="mb-5">
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest text-white" style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)" }}>{product.category}</span>
            </div>

            <h1 className="font-black text-5xl md:text-6xl uppercase tracking-tighter mb-5 text-white leading-[0.9]">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-3">
              <p className="text-4xl font-black gradient-text-red-orange">৳{product.price.toFixed(0)}</p>
              <p className="text-xl font-black text-slate-600 line-through">৳999</p>
              <span className="text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-widest" style={{ background: "rgba(255,23,68,0.15)", border: "1px solid rgba(255,23,68,0.3)", color: "#ff4500" }}>40% OFF</span>
            </div>

            <div className="flex items-center gap-2 mb-8">
              <Flame className="w-3.5 h-3.5" style={{ color: "#ff4500" }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,69,0,0.8)" }}>Free Shipping · Heavyweight Black · 300gsm Cotton</p>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-10 uppercase tracking-wide font-medium">{product.description}</p>

            <div className="space-y-8 mb-10">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-black uppercase tracking-widest text-sm text-white">Size {selectedSize && <span className="text-slate-500 ml-2 font-bold">— {selectedSize}</span>}</h3>
                  {sizeError && <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#ff1744" }}>Please select a size</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className="h-12 min-w-[3rem] px-4 font-black uppercase tracking-wider transition-all duration-200 rounded-xl text-sm"
                      style={selectedSize === size
                        ? { background: "linear-gradient(135deg, #ff1744, #ff4500)", color: "white", border: "1px solid transparent", boxShadow: "0 0 20px rgba(255,23,68,0.35)" }
                        : sizeError
                        ? { background: "rgba(255,23,68,0.05)", color: "#94a3b8", border: "1px solid rgba(255,23,68,0.25)" }
                        : { background: "rgba(255,255,255,0.03)", color: "#94a3b8", border: "1px solid rgba(255,23,68,0.12)" }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-black uppercase tracking-widest text-sm mb-4 text-white">Quantity</h3>
                <div className="flex items-center w-36 h-12 rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,23,68,0.12)" }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-white transition-colors"><Minus className="w-4 h-4" /></button>
                  <div className="flex-1 text-center font-black text-base text-white">{quantity}</div>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={handleBuyNow} disabled={isBuyingNow} className="btn-ai w-full h-14 rounded-xl text-sm flex items-center justify-center gap-3 disabled:opacity-60">
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {isBuyingNow ? "Processing..." : <><Zap className="w-5 h-5" fill="currentColor" />Buy Now — ৳{(product.price * quantity).toFixed(0)}</>}
                </span>
              </button>
              <button onClick={handleAddToCart} disabled={addCartItem.isPending} className="btn-ai-outline w-full h-12 rounded-xl text-xs flex items-center justify-center gap-2.5 disabled:opacity-60">
                <ShoppingBag className="w-4 h-4" />{addCartItem.isPending ? "Adding..." : "Add to Bag"}
              </button>
              <Link href="/customize">
                <button className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all hover:bg-white/5 text-slate-500 hover:text-white">
                  <Paintbrush className="w-4 h-4" />Or Upload Your Own Design
                </button>
              </Link>
            </div>

            <div className="mt-8 pt-6 grid grid-cols-3 gap-4 text-center" style={{ borderTop: "1px solid rgba(255,23,68,0.1)" }}>
              {[{ label: "Free Shipping", sub: "All Bangladesh" }, { label: "Easy Returns", sub: "30-day policy" }, { label: "Secure Pay", sub: "Encrypted" }].map(({ label, sub }) => (
                <div key={label}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">{label}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
