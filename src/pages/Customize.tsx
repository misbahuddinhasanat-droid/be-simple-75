import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  useListProducts,
  useUploadDesign,
} from "@/lib/api";
import { useAddCartItem, getGetCartQueryKey } from "@/lib/cart-store";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Plus, Minus, Zap, ShoppingBag, ChevronRight, Layers, Settings2, Eye } from "lucide-react";
import { useBuyNow } from "@/hooks/useBuyNow";
import { motion } from "framer-motion";

type View = "front" | "back";
type Tab = "preview" | "design" | "options";

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

const VIEWS: { id: View; label: string; front: string; back: string }[] = [
  { id: "front", label: "Front", front: "/products/blessed-front.jpg", back: "/products/blessed-front.jpg" },
  { id: "back",  label: "Back",  front: "/products/angel-back.jpg",   back: "/products/angel-back.jpg" },
];

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
  const [activeTab, setActiveTab] = useState<Tab>("preview");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const customProduct = products?.[0];
  const price = customProduct?.price ?? 1250;

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
        setActiveTab("preview"); // Switch to preview to see it
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
      className="flex flex-col md:flex-row bg-[#050508] text-white overflow-hidden w-full min-h-0 md:min-h-[calc(100vh-5rem)] min-h-[calc(100dvh-5rem)]"
      style={{ maxHeight: "none" }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
      onDrop={handleDrop}
    >
      {/* ── MOBILE TAB NAVIGATION ── */}
      <div className="flex md:hidden bg-[#0a0a0c] border-b border-white/5 px-2">
        {(["preview", "design", "options"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab ? "text-rose-500" : "text-slate-500"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              {tab === "preview" && <Eye className="w-4 h-4" />}
              {tab === "design" && <Layers className="w-4 h-4" />}
              {tab === "options" && <Settings2 className="w-4 h-4" />}
              {tab}
            </div>
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />}
          </button>
        ))}
      </div>

      {/* ── LEFT THUMBNAIL STRIP (DESKTOP) ── */}
      <div className="hidden md:flex w-[80px] flex-shrink-0 bg-[#080808] border-r border-white/5 flex-col items-center py-6 gap-4 overflow-y-auto">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className="flex flex-col items-center gap-2 group w-full px-3"
          >
            <div className={`w-full aspect-[3/4] border-2 overflow-hidden transition-all rounded-lg ${
              view === v.id ? "border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]" : "border-white/5 group-hover:border-white/20"
            }`}>
              <img
                src={v.id === "front" ? "/products/blessed-front.jpg" : "/products/angel-back.jpg"}
                alt={v.label}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${
              view === v.id ? "text-rose-500" : "text-slate-600 group-hover:text-slate-400"
            }`}>
              {v.label}
            </span>
          </button>
        ))}

        <div className="mt-auto w-full px-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square border border-dashed border-white/10 hover:border-rose-500/50 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-600 hover:text-rose-500 transition-all bg-white/2"
          >
            <Upload className="w-4 h-4" />
            <span className="text-[7px] font-black uppercase tracking-widest text-center">Drop<br/>File</span>
          </button>
        </div>
      </div>

      {/* ── CENTER CANVAS (PREVIEW TAB) ── */}
      <div
        className={`flex-1 relative flex flex-col items-center justify-center overflow-hidden transition-opacity duration-300 ${
          activeTab === "preview" ? "opacity-100" : "hidden md:flex opacity-100"
        }`}
        style={{ background: "radial-gradient(circle at 50% 40%, #111115 0%, #050508 100%)" }}
      >
        {/* View Switcher (Mobile) */}
        <div className="md:hidden absolute top-6 flex gap-2 z-20">
           {VIEWS.map(v => (
             <button 
              key={v.id} 
              onClick={() => setView(v.id)}
              className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                view === v.id ? "bg-rose-600 border-rose-600 text-white shadow-lg" : "bg-white/5 border-white/10 text-slate-500"
              }`}
             >
               {v.label}
             </button>
           ))}
        </div>

        {/* View labels */}
        <div className="absolute top-5 left-5 hidden md:flex flex-col gap-2 z-10">
          <span className="bg-black/50 backdrop-blur border border-white/5 text-[9px] font-black px-3 py-1.5 uppercase tracking-widest text-slate-400 rounded-lg">
            {view === "front" ? "Perspective: Front" : "Perspective: Back"}
          </span>
          {designDataUrl && !isUploading && (
            <span className="bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black px-3 py-1.5 uppercase tracking-widest rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Asset Applied
            </span>
          )}
          {isUploading && (
            <span className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black px-3 py-1.5 uppercase tracking-widest rounded-lg flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Uplinking...
            </span>
          )}
        </div>

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-30 border-4 border-dashed border-rose-500/30 bg-[#050508]/80 flex items-center justify-center pointer-events-none backdrop-blur-sm">
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Upload className="w-8 h-8 text-rose-500" />
              </div>
              <p className="font-black text-white text-2xl uppercase tracking-tighter italic">Transfer Data</p>
            </div>
          </div>
        )}

        {/* T-shirt photo mockup */}
        <div className="relative w-full h-full max-h-[85vh] flex items-center justify-center p-4">
          <div className="relative h-full aspect-[4/5] md:aspect-auto">
            <img
              src={mockupSrc}
              alt="T-shirt mockup"
              className="h-full w-auto object-contain object-center drop-shadow-[0_35px_60px_rgba(0,0,0,0.8)] select-none pointer-events-none"
              style={{ maxHeight: "100%", maxWidth: "100%" }}
              draggable={false}
            />

            {/* Design overlay positioned on print area */}
            <div
              className="absolute pointer-events-none"
              style={{ top: printArea.top, left: printArea.left, width: printArea.width, height: printArea.height }}
            >
              {designDataUrl ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 0.92, scale: 1 }}
                  src={designDataUrl}
                  alt="Your design"
                  className="w-full h-full object-contain"
                  style={{ mixBlendMode: "screen" }}
                />
              ) : (
                <div
                  className="w-full h-full border border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer pointer-events-auto hover:bg-white/5 transition-colors rounded-lg"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p className="font-black text-slate-800 text-[10px] uppercase tracking-[0.3em] text-center leading-tight">
                    DROP<br />ASSET<br />HERE
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom utility links */}
        <div className="absolute bottom-6 flex gap-4">
          <Link
            href="/design-templates"
            className="bg-white/5 backdrop-blur border border-white/10 text-[9px] font-black px-6 py-3 uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:border-white/30 transition-all rounded-xl"
          >
            Vault Templates
          </Link>
        </div>
      </div>

      {/* ── RIGHT CONFIG PANEL (DESIGN + OPTIONS TABS) ── */}
      <div className={`w-full md:w-[320px] lg:w-[380px] flex-shrink-0 bg-[#0a0a0c] border-l border-white/5 flex flex-col overflow-y-auto transition-all ${
        activeTab === "preview" ? "hidden md:flex" : "flex"
      }`}>
        
        {/* Header (Desktop) */}
        <div className="hidden md:block px-8 py-8 border-b border-white/5">
          <h2 className="font-black uppercase tracking-tighter text-white text-3xl italic leading-[0.8]">
            Studio<br />Manifest
          </h2>
          <div className="flex items-center gap-2 mt-4">
             <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Heavyweight Drop · 300gsm</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-10">
          
          {/* UPLOAD SECTION */}
          <div className={activeTab === "design" || activeTab === "preview" ? "block" : "hidden md:block"}>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mb-6">01. Visual Assets</p>

            {designDataUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/2 border border-white/5 group">
                  <div className="w-16 h-16 bg-black border border-white/10 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={designDataUrl} alt="Design" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[11px] uppercase tracking-widest text-white">Asset Uploaded</p>
                    <p className="text-[9px] font-bold tracking-widest uppercase mt-1 text-slate-500">
                      {isUploading ? "Syncing to Cloud..." : "Integrated with T-Shirt"}
                    </p>
                  </div>
                  <button
                    onClick={() => { setDesignDataUrl(null); setUploadedUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 rounded-xl border border-white/5 hover:border-rose-500/50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-white/2"
                >
                  Upload New Layer
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center text-center cursor-pointer transition-all ${
                  isDragging ? "border-rose-500 bg-rose-500/5" : "border-white/5 hover:border-white/20 hover:bg-white/2"
                }`}
              >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-slate-500" />
                </div>
                <p className="font-black uppercase tracking-widest text-xs text-white mb-2">Import Design</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Vector · High-Res PNG · JPG</p>
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

          {/* CONFIGURATION SECTION */}
          <div className={activeTab === "options" || activeTab === "preview" ? "block" : "hidden md:block"}>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mb-6">02. Parameters</p>
            
            <div className="space-y-8">
              {/* SIZE */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Select Size</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white bg-rose-600 px-2 py-0.5 rounded">{size}</p>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`h-10 rounded-lg border-2 font-black text-[10px] transition-all ${
                        size === s
                          ? "border-rose-600 bg-rose-600 text-white"
                          : "border-white/5 text-slate-500 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUANTITY */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 italic">Quantity</p>
                <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-white/10 bg-[#050508] w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors border-r border-white/5"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 text-center font-black text-base text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors border-l border-white/5"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FINAL SUMMARY */}
          <div className="mt-auto pt-8 border-t border-white/5">
             <div className="flex items-end justify-between mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Total Valuation</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-rose-500">Premium Cotton · Free Shipping</p>
                </div>
                <div className="text-right">
                   <p className="text-4xl font-black text-white italic tracking-tighter leading-none">৳{(price * quantity).toFixed(0)}</p>
                   <p className="text-[10px] font-bold text-slate-700 line-through mt-1 tracking-widest">৳{(1850 * quantity).toFixed(0)}</p>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-3">
               <button
                onClick={handleBuyNow}
                disabled={isBuyingNow || !customProduct}
                className="w-full h-16 bg-rose-600 hover:bg-white hover:text-black text-white font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 disabled:opacity-50 rounded-2xl shadow-xl shadow-rose-600/10 group"
              >
                {isBuyingNow ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Uplinking...</>
                ) : (
                  <><Zap className="w-5 h-5 group-hover:scale-125 transition-transform" fill="currentColor" /> Secure This Drop</>
                )}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={addCartItem.isPending || !customProduct}
                className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                {addCartItem.isPending ? "Adding..." : "Stash in Bag"}
              </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
