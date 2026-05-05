import { useGetProduct } from "@/lib/api";
import { useAddCartItem, getGetCartQueryKey } from "@/lib/cart-store";
import { useParams, Link } from "wouter";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Paintbrush, Minus, Plus, Zap, ShoppingBag, ArrowLeft, MessageCircle, Phone, Truck, ShieldCheck, Loader2, Flame } from "lucide-react";
import { useBuyNow } from "@/hooks/useBuyNow";
import { useSEO } from "@/hooks/useSEO";
import { useSettings } from "@/hooks/useSettings";
import { pushPixelEvent } from "@/hooks/useGTM";

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading, error } = useGetProduct(Number(id), { query: { enabled: !!id, queryKey: [`/api/products/${id}`] } });
  
  useEffect(() => {
    if (product) {
      pushPixelEvent("ViewContent", {
        content_name: product.name,
        content_category: product.category,
        content_ids: [product.id],
        content_type: "product",
        value: product.price,
        currency: "BDT"
      });
    }
  }, [product]);

  const { data: settings } = useSettings();
  const addCartItem = useAddCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { buyNow, isPending: isBuyingNow } = useBuyNow();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    if (product && !selectedSize && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) setShowSticky(true);
      else setShowSticky(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("sticky-bar", { detail: showSticky }));
  }, [showSticky]);

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

  const validateSize = () => { if (!selectedSize) { setSizeError(true); return false; } return true; };
  
  const handleAddToCart = () => {
    if (!validateSize()) return;
    addCartItem.mutate({ data: { productId: product.id, size: selectedSize, color: "Black", quantity } }, {
      onSuccess: () => { 
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }); 
        toast({ title: "Added to Bag", description: `${quantity}× ${product.name} added.` }); 
        pushPixelEvent("AddToCart", {
          content_name: product.name,
          content_category: product.category,
          content_ids: [product.id],
          content_type: "product",
          value: product.price * quantity,
          currency: "BDT"
        });
      },
      onError: () => toast({ title: "Error", description: "Could not add to bag.", variant: "destructive" }),
    });
  };

  const handleBuyNow = () => { 
    if (!validateSize()) return; 
    pushPixelEvent("AddToCart", {
      content_name: product.name,
      content_category: product.category,
      content_ids: [product.id],
      content_type: "product",
      value: product.price * quantity,
      currency: "BDT"
    });
    buyNow(product.id, selectedSize, "Black", quantity); 
  };

  const dialDigits = settings?.storeInfo?.whatsappNumber?.replace(/\D/g, "") ?? "";

  const handleWhatsAppOrder = () => {
    if (!validateSize()) return;
    const msg = `Hi! I want to order ${quantity}x ${product.name} (${selectedSize}). Product Link: ${window.location.href}`;
    const wa = dialDigits ? `https://wa.me/${dialDigits}?text=${encodeURIComponent(msg)}` : settings?.storeInfo?.whatsappUrl;
    if (wa) window.open(wa, "_blank");
  };

  const handleMessengerOrder = () => {
    if (!validateSize()) return;
    const mu = settings?.storeInfo?.siMessengerUrl?.startsWith("http")
      ? settings.storeInfo.siMessengerUrl
      : `https://m.me/${(settings?.storeInfo?.siMessengerUrl ?? "besimple75").replace("@", "")}`;
    window.open(mu, "_blank");
  };

  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#f5f6fa" }} className="pb-24">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(255,23,68,0.07) 0%, transparent 70%)" }} />
      </div>

      <div className="container px-4 md:px-8 py-10 relative z-10">
        <Link href="/products" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors mb-10 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />Back to Collection
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          <div className="aspect-[4/5] overflow-hidden md:sticky md:top-24 rounded-3xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,23,68,0.12)" }}>
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-top" />
          </div>

          <div className="flex flex-col py-2 md:py-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest text-white" style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)" }}>{product.category}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-green-500 flex items-center gap-1.5 bg-green-500/5 px-3 py-1.5 rounded-full border border-green-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> In Stock
              </span>
            </div>

            <h1 className="font-black text-5xl md:text-7xl uppercase tracking-tighter mb-5 text-white leading-[0.85]">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-6">
              {product.salePrice ? (
                <>
                  <p className="text-5xl font-black gradient-text-red-orange tracking-tighter">৳{product.salePrice.toFixed(0)}</p>
                  <p className="text-2xl font-black text-slate-600 line-through tracking-tighter">৳{product.price.toFixed(0)}</p>
                  <span className="text-xs font-black px-2.5 py-1 rounded-xl uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 text-rose-500">
                    {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <p className="text-5xl font-black gradient-text-red-orange tracking-tighter">৳{product.price.toFixed(0)}</p>
              )}
            </div>

            <div className="flex items-center gap-2 mb-10">
              <div className="w-5 h-5 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 border border-white/10">
                <img src="/logo.png" alt="" className="w-full h-full object-contain" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Premium Drop · <span className="text-rose-500">Free Shipping</span> · Heavyweight 300gsm
              </p>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-12 uppercase tracking-wide font-medium border-l-2 border-rose-500/20 pl-6">{product.description}</p>

            <div className="space-y-10 mb-12">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-black uppercase tracking-widest text-xs text-white">Select Size</h3>
                  {sizeError && <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Required</p>}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className={`h-14 min-w-[3.5rem] px-6 font-black uppercase tracking-widest transition-all duration-300 rounded-2xl text-xs ${selectedSize === size ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]' : 'bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-black uppercase tracking-widest text-xs mb-4 text-white">Quantity</h3>
                <div className="flex items-center w-40 h-14 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-full flex items-center justify-center text-slate-500 hover:text-white transition-colors border-r border-white/5"><Minus className="w-4 h-4" /></button>
                  <div className="flex-1 text-center font-black text-lg text-white">{quantity}</div>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-14 h-full flex items-center justify-center text-slate-500 hover:text-white transition-colors border-l border-white/5"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button onClick={handleBuyNow} disabled={isBuyingNow} className="btn-ai w-full h-18 rounded-2xl text-base flex items-center justify-center gap-3 disabled:opacity-60 animate-attention group">
                {isBuyingNow ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Zap className="w-5 h-5 transition-transform group-hover:scale-125" fill="currentColor" />Confirm Drop — ৳{((product.salePrice || product.price) * quantity).toFixed(0)}</>}
              </button>

              <button onClick={handleAddToCart} disabled={addCartItem.isPending} className="btn-ai-outline w-full h-14 rounded-2xl text-xs flex items-center justify-center gap-2.5 disabled:opacity-60">
                <ShoppingBag className="w-4 h-4" />{addCartItem.isPending ? "Adding..." : "Add to Bag"}
              </button>

              <Link href="/customize">
                <button type="button" className="w-full min-h-[3.25rem] py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.18em] flex items-center justify-center gap-2.5 transition-all bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 touch-manipulation">
                  <Paintbrush className="w-3.5 h-3.5" /> Upload your own design
                </button>
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={handleWhatsAppOrder} className="h-14 rounded-2xl bg-green-600/10 border border-green-600/25 flex flex-col items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wider text-green-400 hover:bg-green-600 hover:text-white transition-all touch-manipulation px-2 text-center leading-tight">
                  <MessageCircle className="w-4 h-4 shrink-0" /> Order via WhatsApp
                </button>
                <button type="button" onClick={handleMessengerOrder} className="h-14 rounded-2xl bg-blue-600/10 border border-blue-600/25 flex flex-col items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wider text-blue-400 hover:bg-blue-600 hover:text-white transition-all touch-manipulation px-2 text-center leading-tight">
                  <MessageCircle className="w-4 h-4 shrink-0" /> Order via Messenger
                </button>
              </div>
            </div>

            <div className="mt-12 pt-8 grid grid-cols-3 gap-6 text-center border-t border-white/5">
              {[{ label: "Free Shipping", sub: "Nationwide", icon: <Truck className="w-4 h-4 mx-auto mb-2 text-rose-500" /> }, { label: "7 Day Return", sub: "Easy Swap", icon: <ShieldCheck className="w-4 h-4 mx-auto mb-2 text-rose-500" /> }, { label: "Premium Fit", sub: "300gsm Cotton", icon: <Flame className="w-4 h-4 mx-auto mb-2 text-rose-500" /> }].map(({ label, sub, icon }) => (
                <div key={label}>
                  {icon}
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">{label}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-600 mt-1">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Buy Now Bar */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 pb-8 bg-[#050508]/95 backdrop-blur-xl border-t border-white/10 z-[60] md:hidden transition-all duration-500 ease-out ${showSticky ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total</span>
            <span className="text-xl font-black gradient-text-red-orange tracking-tighter">৳{((product.salePrice || product.price) * quantity).toFixed(0)}</span>
          </div>
          <button onClick={handleBuyNow} disabled={isBuyingNow} className="btn-ai h-14 flex-1 rounded-2xl text-xs flex items-center justify-center gap-2 disabled:opacity-60 animate-attention">
            {isBuyingNow ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" fill="currentColor" />Confirm Drop</>}
          </button>
        </div>
      </div>
    </div>
  );
}
