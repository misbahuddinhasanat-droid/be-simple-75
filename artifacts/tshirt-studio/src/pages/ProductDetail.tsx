import { useGetProduct, useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Paintbrush, Minus, Plus, Zap, ShoppingBag } from "lucide-react";
import { useBuyNow } from "@/hooks/useBuyNow";

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: product, isLoading, error } = useGetProduct(Number(id), {
    query: { enabled: !!id, queryKey: [`/api/products/${id}`] },
  });
  const addCartItem = useAddCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { buyNow, isPending: isBuyingNow } = useBuyNow();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen">
        <div className="container px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-[#111] animate-pulse border border-[#1f1f1f]" />
          <div className="space-y-8 py-8">
            <div className="h-16 bg-[#111] animate-pulse w-3/4" />
            <div className="h-10 bg-[#111] animate-pulse w-1/4" />
            <div className="h-40 bg-[#111] animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <div className="container px-4 py-20 text-center">
          <h2 className="font-display text-5xl font-black uppercase text-white mb-6">404 — Drop Not Found</h2>
          <p className="text-zinc-400 text-lg uppercase tracking-wider mb-10">The product you're looking for has vanished.</p>
          <Link href="/products">
            <Button className="h-16 px-10 font-black uppercase tracking-widest bg-white text-black hover:bg-zinc-200 rounded-none text-lg">
              Back to Collection
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedSize && product.sizes.length > 0) setSelectedSize(product.sizes[0]);

  const validateSize = () => {
    if (!selectedSize) { setSizeError(true); return false; }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSize()) return;
    addCartItem.mutate(
      { data: { productId: product.id, size: selectedSize, color: "Black", quantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Added to Bag", description: `${quantity}× ${product.name} added.` });
        },
        onError: () => {
          toast({ title: "Error", description: "Could not add to bag.", variant: "destructive" });
        },
      }
    );
  };

  const handleBuyNow = () => {
    if (!validateSize()) return;
    buyNow(product.id, selectedSize, "Black", quantity);
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-[#f0f0f0] pb-24">
      <div className="container px-4 md:px-8 py-12 lg:py-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-8">
          <Link href="/products" className="hover:text-white transition-colors">Collection</Link>
          <span>/</span>
          <span className="text-zinc-400">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Product Image */}
          <div className="aspect-[4/5] overflow-hidden bg-[#050505] sticky top-24 border-2 border-[#1f1f1f]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col py-4 md:py-10">
            <div className="mb-4">
              <span className="text-xs font-black text-white bg-[#e63329] px-3 py-1 uppercase tracking-widest">
                {product.category}
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-white leading-[0.9]">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3 mb-6">
              <p className="text-4xl font-black text-[#e63329]">৳{product.price.toFixed(0)}</p>
              <p className="text-xl font-black text-zinc-600 line-through">৳999</p>
              <span className="text-xs font-black bg-[#e63329] text-white px-2 py-1 uppercase tracking-widest">40% OFF</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-[#e63329] mb-8">
              Free Shipping · Heavyweight Black · 300gsm Cotton
            </p>

            <div className="prose prose-invert mb-10">
              <p className="text-zinc-400 text-base leading-relaxed font-medium uppercase tracking-wide">
                {product.description}
              </p>
            </div>

            <div className="space-y-8 mb-10">
              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-black uppercase tracking-widest text-sm text-white">
                    Size
                    {selectedSize && <span className="text-zinc-400 ml-2">— {selectedSize}</span>}
                  </h3>
                  {sizeError && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#e63329]">
                      Please select a size
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className={`h-14 min-w-[3.5rem] px-4 border-2 font-black uppercase tracking-wider transition-all rounded-none ${
                        selectedSize === size
                          ? "border-white bg-white text-black"
                          : sizeError
                          ? "border-[#e63329]/50 bg-transparent text-zinc-300 hover:border-zinc-500"
                          : "border-[#1f1f1f] bg-transparent hover:border-zinc-500 text-zinc-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="font-black uppercase tracking-widest text-sm mb-4 text-white">Quantity</h3>
                <div className="flex items-center border-2 border-[#1f1f1f] w-36 h-14 bg-[#050505]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors hover:bg-[#1f1f1f]"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="flex-1 text-center font-black text-lg text-white">{quantity}</div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors hover:bg-[#1f1f1f]"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 mt-auto">
              {/* Primary: Buy Now */}
              <Button
                size="lg"
                className="w-full h-16 font-black uppercase tracking-widest text-lg bg-[#e63329] hover:bg-white hover:text-black text-white transition-colors border-2 border-transparent rounded-none flex items-center gap-3"
                onClick={handleBuyNow}
                disabled={isBuyingNow}
              >
                {isBuyingNow ? (
                  "Processing..."
                ) : (
                  <>
                    <Zap className="w-5 h-5" fill="currentColor" />
                    Buy Now — ৳{(product.price * quantity).toFixed(0)}
                  </>
                )}
              </Button>

              {/* Secondary: Add to Bag */}
              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 font-black uppercase tracking-widest border-2 border-[#1f1f1f] bg-transparent hover:bg-[#1f1f1f] hover:text-white text-zinc-300 rounded-none flex items-center gap-3"
                onClick={handleAddToCart}
                disabled={addCartItem.isPending}
              >
                <ShoppingBag className="w-5 h-5" />
                {addCartItem.isPending ? "Adding..." : "Add to Bag"}
              </Button>

              {/* Tertiary: Customize */}
              <Link href="/customize">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full h-12 font-black uppercase tracking-widest text-sm gap-3 bg-transparent hover:bg-[#111] text-zinc-500 hover:text-white rounded-none"
                >
                  <Paintbrush className="w-4 h-4" />
                  Or Upload Your Own Design
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-8 pt-6 border-t border-[#1f1f1f] grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Free Shipping", sub: "Worldwide" },
                { label: "Easy Returns", sub: "30-day policy" },
                { label: "Secure Pay", sub: "Encrypted" },
              ].map(({ label, sub }) => (
                <div key={label}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">{label}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-600 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
