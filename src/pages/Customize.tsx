import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  useListProducts,
  useUploadDesign,
  useAddCartItem,
  getGetCartQueryKey,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Plus, Minus, Zap, ShoppingBag, ChevronRight } from "lucide-react";
import { useBuyNow } from "@/hooks/useBuyNow";

type View = "front" | "back";

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

const VIEWS: { id: View; label: string; front: string; back: string }[] = [
  { id: "front", label: "Front", front: "/products/blessed-front.jpg", back: "/products/blessed-front.jpg" },
  { id: "back",  label: "Back",  front: "/products/angel-back.jpg",   back: "/products/angel-back.jpg" },
];

// Print area as % of image dimensions for overlay positioning
const PRINT_AREA = {
  front: { top: "27%", left: "28%", width: "44%", height: "33%" },
  back:  { top: "22%", left: "25%", width: "50%", height: "42%" },
};

export default function Customize() {
  const [, setLocation] = useLocation();
  const { data: products } = useListProducts();
  const uploadDesign = useUploadDesign();
  const addCartItem = useAddCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { buyNow, isPending: isBuyingNow } = useBuyNow();

  const [view, setView] = useState<View>("front");
  const [size, setSize] = useState("XL");
  const [quantity, setQuantity] = useState(1);
  const [designDataUrl, setDesignDataUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const customProduct = products?.[0];
  const price = customProduct?.price ?? 44.99;

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB allowed.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        setDesignDataUrl(base64);
        setIsUploading(true);
        try {
          const result = await uploadDesign.mutateAsync({ data: { imageData: base64, filename: file.name } });
          setUploadedUrl(result.url);
        } catch {
          // keep local preview
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [uploadDesign, toast]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleAddToCart = () => {
    if (!customProduct) return;
    addCartItem.mutate(
      { data: { productId: customProduct.id, size, color: "Black", quantity, customDesignUrl: uploadedUrl ?? null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Added to Bag", description: "Your custom piece is ready." });
          setLocation("/cart");
        },
        onError: () => {
          toast({ title: "Error", description: "Could not add to bag.", variant: "destructive" });
        },
      }
    );
  };

  const handleBuyNow = () => {
    if (!customProduct) return;
    buyNow(customProduct.id, size, "Black", quantity);
  };

  const printArea = PRINT_AREA[view];
  const mockupSrc = view === "front" ? "/products/blessed-front.jpg" : "/products/angel-back.jpg";

  return (
    <div
      className="flex bg-[#0a0a0a] text-white overflow-hidden"
      style={{ height: "calc(100vh - 64px)" }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
      onDrop={handleDrop}
    >
      {/* ── LEFT THUMBNAIL STRIP ── */}
      <div className="w-[76px] flex-shrink-0 bg-[#080808] border-r border-[#1a1a1a] flex flex-col items-center py-4 gap-3 overflow-y-auto">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className="flex flex-col items-center gap-1.5 group w-full px-2"
          >
            <div className={`w-full aspect-[3/4] border-2 overflow-hidden transition-all ${
              view === v.id ? "border-white" : "border-[#2a2a2a] group-hover:border-zinc-500"
            }`}>
              <img
                src={v.id === "front" ? "/products/blessed-front.jpg" : "/products/angel-back.jpg"}
                alt={v.label}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
              view === v.id ? "text-white" : "text-zinc-600 group-hover:text-zinc-400"
            }`}>
              {v.label}
            </span>
          </button>
        ))}

        <div className="mt-auto w-full px-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square border border-[#2a2a2a] hover:border-zinc-500 flex flex-col items-center justify-center gap-1 text-zinc-600 hover:text-white transition-all"
          >
            <Upload className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase tracking-widest">Upload</span>
          </button>
        </div>
      </div>

      {/* ── CENTER CANVAS ── */}
      <div
        className="flex-1 relative flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "radial-gradient(ellipse 80% 80% at 50% 40%, #181818 0%, #0a0a0a 100%)" }}
      >
        {/* View label + status */}
        <div className="absolute top-5 left-5 flex gap-2 z-10">
          <span className="bg-black/70 backdrop-blur border border-[#2a2a2a] text-[10px] font-black px-3 py-1.5 uppercase tracking-widest text-zinc-400">
            {view === "front" ? "Front View" : "Back View"}
          </span>
          {designDataUrl && !isUploading && (
            <span className="bg-[#e63329] text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest">
              Design Applied
            </span>
          )}
          {isUploading && (
            <span className="bg-black/70 backdrop-blur border border-[#2a2a2a] text-[10px] font-black px-3 py-1.5 uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing...
            </span>
          )}
        </div>

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-30 border-2 border-dashed border-white/40 bg-black/60 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Upload className="w-10 h-10 mx-auto mb-3 text-white" />
              <p className="font-black text-white text-xl uppercase tracking-widest">Drop Your Design</p>
            </div>
          </div>
        )}

        {/* T-shirt photo mockup */}
        <div className="relative h-full max-h-[calc(100%-80px)] flex items-center justify-center py-8">
          <div className="relative h-full max-h-full">
            <img
              src={mockupSrc}
              alt="T-shirt mockup"
              className="h-full w-auto object-contain object-top max-w-none drop-shadow-2xl select-none"
              style={{ maxHeight: "100%", maxWidth: "500px" }}
              draggable={false}
            />

            {/* Design overlay positioned on print area */}
            <div
              className="absolute pointer-events-none"
              style={{ top: printArea.top, left: printArea.left, width: printArea.width, height: printArea.height }}
            >
              {designDataUrl ? (
                <img
                  src={designDataUrl}
                  alt="Your design"
                  className="w-full h-full object-contain"
                  style={{ mixBlendMode: "screen", opacity: 0.92 }}
                />
              ) : (
                <div
                  className="w-full h-full border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer pointer-events-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p className="font-black text-white/30 text-xs uppercase tracking-widest text-center leading-tight">
                    Your<br />Design<br />Here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom nav links */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <Link
            href="/products"
            className="bg-black/70 backdrop-blur border border-[#2a2a2a] text-[10px] font-black px-4 py-2 uppercase tracking-widest text-zinc-500 hover:text-white hover:border-zinc-500 transition-all"
          >
            Browse Products
          </Link>
          <Link
            href="/design-templates"
            className="bg-black/70 backdrop-blur border border-[#2a2a2a] text-[10px] font-black px-4 py-2 uppercase tracking-widest text-zinc-500 hover:text-white hover:border-zinc-500 transition-all"
          >
            Design Templates
          </Link>
        </div>
      </div>

      {/* ── RIGHT CONFIG PANEL ── */}
      <div className="w-[300px] flex-shrink-0 bg-[#0d0d0d] border-l border-[#1a1a1a] flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1a1a1a]">
          <h2 className="font-black uppercase tracking-tight text-white text-lg leading-tight">
            Design Custom<br />T-Shirt
          </h2>
          <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mt-1">Heavyweight Black · 300gsm</p>
        </div>

        <div className="flex-1 flex flex-col gap-0 divide-y divide-[#1a1a1a]">

          {/* UPLOAD DESIGN */}
          <div className="px-6 py-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Your Design</p>

            {designDataUrl ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-[#111] border border-[#1f1f1f]">
                  <div className="w-14 h-14 bg-black border border-[#2a2a2a] overflow-hidden flex-shrink-0">
                    <img src={designDataUrl} alt="Design" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[11px] uppercase tracking-wide text-white">Design Active</p>
                    <p className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${isUploading ? "text-zinc-400" : "text-[#e63329]"}`}>
                      {isUploading ? "Uploading..." : "Live on Tee"}
                    </p>
                  </div>
                  <button
                    onClick={() => { setDesignDataUrl(null); setUploadedUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-zinc-600 hover:text-white transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 border border-[#2a2a2a] hover:border-white text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all"
                >
                  Replace Design
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-6 flex flex-col items-center text-center cursor-pointer transition-all ${
                  isDragging ? "border-white bg-[#1a1a1a]" : "border-[#2a2a2a] hover:border-[#444] hover:bg-[#111]"
                }`}
              >
                <div className="w-10 h-10 bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="font-black uppercase tracking-wider text-[12px] text-white mb-1">Upload Artwork</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-600">PNG · JPG · Max 10MB</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-700 mt-0.5">or drag &amp; drop anywhere</p>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* BROWSE TEMPLATES */}
          <div className="px-6 py-4">
            <Link
              href="/design-templates"
              className="flex items-center justify-between w-full group"
            >
              <div>
                <p className="font-black uppercase tracking-wider text-[12px] text-white">Browse Templates</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-600 mt-0.5">16 designs available</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </Link>
          </div>

          {/* SIZE */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Size</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white">{size}</p>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-9 border-2 font-black text-[10px] transition-all ${
                    size === s
                      ? "border-white bg-white text-black"
                      : "border-[#2a2a2a] text-zinc-400 hover:border-zinc-500 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* COLOR */}
          <div className="px-6 py-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Color</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#111] border-2 border-white rounded-sm flex-shrink-0" />
              <span className="font-black uppercase tracking-wider text-[11px] text-white">Heavyweight Black</span>
            </div>
          </div>

          {/* QUANTITY */}
          <div className="px-6 py-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Quantity</p>
            <div className="flex items-center gap-0 border-2 border-[#2a2a2a] bg-[#080808] w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-[#1a1a1a] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-black text-sm text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-[#1a1a1a] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PRICE */}
          <div className="px-6 py-4 bg-[#080808]">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Total</p>
                <p className="font-black text-[11px] uppercase tracking-wide text-zinc-500 mt-0.5">Free shipping · No minimum</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="font-black text-2xl text-white">৳{(price * quantity).toFixed(0)}</p>
                <p className="text-zinc-600 font-bold text-sm line-through">৳{(999 * quantity).toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA BUTTONS */}
        <div className="p-4 border-t border-[#1a1a1a] space-y-2 flex-shrink-0">
          <button
            onClick={handleBuyNow}
            disabled={isBuyingNow || !customProduct}
            className="w-full h-12 bg-[#e63329] hover:bg-white hover:text-black text-white font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isBuyingNow ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
            ) : (
              <><Zap className="w-4 h-4" fill="currentColor" />Buy Now — ৳{(price * quantity).toFixed(0)}</>
            )}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={addCartItem.isPending || !customProduct}
            className="w-full h-10 border-2 border-[#2a2a2a] hover:border-white text-zinc-400 hover:text-white font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4" />
            {addCartItem.isPending ? "Adding..." : "Add to Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
