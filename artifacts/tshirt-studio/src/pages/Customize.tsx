import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  useListProducts,
  useUploadDesign,
  useAddCartItem,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Upload, Type, Layers, Package, X, Loader2, ChevronUp, ChevronDown } from "lucide-react";

type View = "front" | "back";
type BodyType = "slim" | "medium" | "oversized";
type Gender = "man" | "woman";
type ActivePanel = "upload" | "bodytype" | "size" | null;

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

function TShirtSVG({ view, design }: { view: View; design: string | null }) {
  const printBox =
    view === "front"
      ? { x: 72, y: 88, w: 76, h: 72 }
      : { x: 55, y: 70, w: 110, h: 110 };

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <svg
        viewBox="0 0 220 260"
        className="w-full h-full max-w-[420px] max-h-[500px] drop-shadow-2xl"
        style={{ filter: "drop-shadow(0 0 40px rgba(0,0,0,0.8))" }}
      >
        <defs>
          <clipPath id="shirtClip">
            <path d="M60,4 C60,4 48,8 40,26 L4,72 L38,84 L38,256 L182,256 L182,84 L216,72 L180,26 C172,8 160,4 160,4 C160,4 148,36 110,36 C72,36 60,4 60,4 Z" />
          </clipPath>
          <filter id="printFilter">
            <feBlend in="SourceGraphic" in2="BackgroundImage" mode="multiply" />
          </filter>
        </defs>

        <path
          d="M60,4 C60,4 48,8 40,26 L4,72 L38,84 L38,256 L182,256 L182,84 L216,72 L180,26 C172,8 160,4 160,4 C160,4 148,36 110,36 C72,36 60,4 60,4 Z"
          fill="#111111"
          stroke="#2a2a2a"
          strokeWidth="1.5"
        />

        <path
          d="M60,4 C60,4 48,8 40,26 L4,72 L38,84 L38,90 L6,78 L40,34 C47,16 58,7 62,5"
          fill="#1a1a1a"
        />
        <path
          d="M160,4 C160,4 172,8 180,26 L216,72 L182,84 L182,90 L214,78 L180,34 C173,16 162,7 158,5"
          fill="#1a1a1a"
        />

        <path
          d="M72,36 C72,36 88,46 110,46 C132,46 148,36 148,36"
          fill="none"
          stroke="#222"
          strokeWidth="1"
        />

        {design ? (
          <image
            href={design}
            x={printBox.x}
            y={printBox.y}
            width={printBox.w}
            height={printBox.h}
            preserveAspectRatio="xMidYMid meet"
            style={{ mixBlendMode: "screen" }}
            clipPath="url(#shirtClip)"
          />
        ) : (
          <g>
            <rect
              x={printBox.x}
              y={printBox.y}
              width={printBox.w}
              height={printBox.h}
              fill="none"
              stroke="#333"
              strokeWidth="1"
              strokeDasharray="4 3"
              rx="2"
            />
            <text
              x={printBox.x + printBox.w / 2}
              y={printBox.y + printBox.h / 2 - 6}
              textAnchor="middle"
              fill="#3a3a3a"
              fontSize="9"
              fontFamily="sans-serif"
              fontWeight="bold"
              letterSpacing="1"
            >
              YOUR DESIGN
            </text>
            <text
              x={printBox.x + printBox.w / 2}
              y={printBox.y + printBox.h / 2 + 8}
              textAnchor="middle"
              fill="#3a3a3a"
              fontSize="9"
              fontFamily="sans-serif"
              fontWeight="bold"
              letterSpacing="1"
            >
              HERE
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function ViewThumb({
  label,
  active,
  onClick,
  imgSrc,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  imgSrc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-1 w-full transition-all ${
        active ? "opacity-100" : "opacity-40 hover:opacity-70"
      }`}
    >
      <div
        className={`w-14 h-14 border overflow-hidden ${
          active ? "border-white" : "border-[#333]"
        }`}
      >
        <img src={imgSrc} alt={label} className="w-full h-full object-cover object-top" />
      </div>
      <span
        className={`text-[9px] font-black uppercase tracking-widest ${
          active ? "text-white" : "text-zinc-500"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export default function Customize() {
  const [, setLocation] = useLocation();
  const { data: products } = useListProducts();
  const uploadDesign = useUploadDesign();
  const addCartItem = useAddCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [view, setView] = useState<View>("front");
  const [activePanel, setActivePanel] = useState<ActivePanel>("upload");
  const [bodyType, setBodyType] = useState<BodyType>("oversized");
  const [gender, setGender] = useState<Gender>("man");
  const [size, setSize] = useState("XL");
  const [quantity, setQuantity] = useState(1);
  const [designDataUrl, setDesignDataUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const customProduct = products?.[0];

  const processFile = useCallback(
    async (file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        setDesignDataUrl(base64);
        setIsUploading(true);
        try {
          const result = await uploadDesign.mutateAsync({
            data: { imageData: base64, filename: file.name },
          });
          setUploadedUrl(result.url);
          toast({ title: "Design Applied", description: "Your artwork is live on the tee." });
        } catch {
          toast({ title: "Saved locally", description: "Preview is live.", variant: "default" });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [uploadDesign, toast]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleAddToCart = () => {
    if (!customProduct) return;
    addCartItem.mutate(
      {
        data: {
          productId: customProduct.id,
          size,
          color: "Black",
          quantity,
          customDesignUrl: uploadedUrl ?? null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Added to Bag", description: "Your custom piece is in the bag." });
          setLocation("/cart");
        },
        onError: () => {
          toast({ title: "Error", description: "Could not add to bag.", variant: "destructive" });
        },
      }
    );
  };

  const sidebarItems = [
    {
      id: "upload" as ActivePanel,
      icon: Upload,
      label: "Upload",
      desc: "Add your design",
    },
    {
      id: null,
      icon: Type,
      label: "Templates",
      desc: "Browse designs",
      href: "/design-templates",
    },
    {
      id: "bodytype" as ActivePanel,
      icon: Package,
      label: "Fit",
      desc: "Slim / Oversized",
    },
    {
      id: "size" as ActivePanel,
      icon: Layers,
      label: "Size",
      desc: `Selected: ${size}`,
    },
  ];

  return (
    <div
      className="flex bg-[#0a0a0a] text-white"
      style={{ height: "calc(100vh - 80px)" }}
    >
      {/* LEFT SIDEBAR */}
      <div className="w-56 bg-[#0d0d0d] border-r border-[#1f1f1f] flex flex-col overflow-y-auto flex-shrink-0">
        <div className="px-5 pt-5 pb-3 border-b border-[#1f1f1f]">
          <p className="font-black text-white uppercase tracking-wider text-xs leading-tight">
            How do you want to start?
          </p>
        </div>

        <div className="flex flex-col gap-0.5 p-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePanel === item.id && item.id !== null;
            const content = (
              <button
                key={item.label}
                onClick={() => {
                  if (item.href) {
                    setLocation(item.href);
                  } else {
                    setActivePanel(activePanel === item.id ? null : item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-all ${
                  isActive
                    ? "bg-white text-black"
                    : "text-zinc-300 hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                    isActive ? "bg-black/10" : "bg-[#1f1f1f]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-black uppercase tracking-wider text-[11px]">{item.label}</p>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wide ${
                      isActive ? "text-black/60" : "text-zinc-500"
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </button>
            );
            return content;
          })}
        </div>

        {/* UPLOAD PANEL */}
        {activePanel === "upload" && (
          <div className="px-3 pb-3 border-t border-[#1f1f1f] mt-1 pt-3">
            {designDataUrl ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#111] border border-[#1f1f1f]">
                  <img
                    src={designDataUrl}
                    alt="Design"
                    className="w-12 h-12 object-contain bg-[#0a0a0a] border border-[#1f1f1f]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[11px] uppercase tracking-wide text-white">Design Active</p>
                    <p className="text-[10px] font-bold tracking-wider uppercase text-[#e63329] mt-0.5">
                      {isUploading ? "Saving..." : "Live on Tee"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDesignDataUrl(null);
                      setUploadedUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-zinc-500 hover:text-[#e63329] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 border border-[#333] text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white transition-all"
                >
                  Replace Design
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-5 flex flex-col items-center text-center cursor-pointer transition-all relative overflow-hidden ${
                  isDragging ? "border-white bg-[#1a1a1a]" : "border-[#2a2a2a] hover:border-[#444]"
                }`}
              >
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <img src="/products/deadly-back.jpg" className="w-full h-full object-cover" alt="" />
                </div>
                <div className="relative z-10 w-10 h-10 bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-3">
                  <Upload className="w-4 h-4 text-zinc-400" />
                </div>
                <p className="font-black uppercase tracking-wider text-[11px] text-white relative z-10">
                  Upload Graphic
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 mt-1.5 relative z-10">
                  PNG / JPG — Max 10MB
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-600 mt-1 relative z-10">
                  Drag &amp; drop anywhere
                </p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}

        {/* BODY TYPE PANEL */}
        {activePanel === "bodytype" && (
          <div className="px-3 pb-3 border-t border-[#1f1f1f] mt-1 pt-3 space-y-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Gender</p>
              <div className="grid grid-cols-2 gap-1.5">
                {(["man", "woman"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`h-9 border font-black uppercase tracking-widest text-[10px] transition-all ${
                      gender === g
                        ? "border-white bg-white text-black"
                        : "border-[#1f1f1f] text-zinc-400 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Fit</p>
              <div className="flex flex-col gap-1.5">
                {(["slim", "medium", "oversized"] as BodyType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setBodyType(type)}
                    className={`h-9 border font-black uppercase tracking-widest text-[10px] transition-all ${
                      bodyType === type
                        ? "border-white bg-white text-black"
                        : "border-[#1f1f1f] text-zinc-400 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SIZE PANEL */}
        {activePanel === "size" && (
          <div className="px-3 pb-3 border-t border-[#1f1f1f] mt-1 pt-3 space-y-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Size</p>
              <div className="grid grid-cols-3 gap-1.5">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-9 border font-black text-xs transition-all ${
                      size === s
                        ? "border-white bg-white text-black"
                        : "border-[#1f1f1f] text-zinc-400 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD INSTRUCTIONS */}
        <div className="mt-auto px-4 py-4 border-t border-[#1f1f1f] space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wide">+ Drag &amp; drop anywhere</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wide">+ Paste from clipboard</span>
          </div>
        </div>

        {/* ADD TO BAG */}
        <div className="px-3 py-3 border-t border-[#1f1f1f] bg-[#0a0a0a]">
          <div className="flex items-center border border-[#1f1f1f] mb-3 bg-[#111]">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#1f1f1f] transition-colors text-lg font-black"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <span className="flex-1 text-center font-black text-sm text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#1f1f1f] transition-colors text-lg font-black"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
          <button
            className="w-full h-11 bg-[#e63329] hover:bg-white hover:text-black text-white font-black uppercase tracking-widest text-[11px] transition-all disabled:opacity-50"
            onClick={handleAddToCart}
            disabled={!customProduct || addCartItem.isPending}
          >
            {addCartItem.isPending
              ? "Adding..."
              : `Add to Bag — $${((customProduct?.price ?? 49.99) * quantity).toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* CENTER CANVAS */}
      <div
        className="flex-1 relative flex items-center justify-center"
        style={{ background: "radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 70%)" }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 border-2 border-dashed border-white/30 bg-white/5 z-20 flex items-center justify-center pointer-events-none">
            <p className="font-black text-white text-2xl uppercase tracking-widest">Drop Design Here</p>
          </div>
        )}

        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <span className="bg-black/80 border border-[#1f1f1f] text-[10px] font-black px-3 py-1.5 uppercase tracking-widest text-zinc-400 backdrop-blur-sm">
            {view === "front" ? "Front View" : "Back View"}
          </span>
          {designDataUrl && (
            <span className="bg-[#e63329] text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest">
              Design Applied
            </span>
          )}
          {isUploading && (
            <span className="bg-black/80 border border-[#1f1f1f] text-[10px] font-black px-3 py-1.5 uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing...
            </span>
          )}
        </div>

        <div className="w-full h-full flex items-center justify-center p-8">
          <TShirtSVG view={view} design={designDataUrl} />
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
          <Link
            href="/products"
            className="bg-black/80 border border-[#1f1f1f] text-[10px] font-black px-4 py-2 uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white transition-all backdrop-blur-sm"
          >
            Browse Products
          </Link>
          <Link
            href="/design-templates"
            className="bg-black/80 border border-[#1f1f1f] text-[10px] font-black px-4 py-2 uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white transition-all backdrop-blur-sm"
          >
            Design Templates
          </Link>
        </div>
      </div>

      {/* RIGHT VIEW SWITCHER */}
      <div className="w-20 bg-[#0d0d0d] border-l border-[#1f1f1f] flex flex-col items-center pt-4 gap-2 flex-shrink-0">
        <ViewThumb
          label="Front"
          active={view === "front"}
          onClick={() => setView("front")}
          imgSrc="/products/blessed-front.jpg"
        />
        <ViewThumb
          label="Back"
          active={view === "back"}
          onClick={() => setView("back")}
          imgSrc="/products/angel-back.jpg"
        />
        <div className="mt-auto pb-4 flex flex-col gap-2 items-center w-full px-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-[#1f1f1f] p-2 flex flex-col items-center gap-1 text-zinc-600 hover:text-white hover:border-zinc-500 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase tracking-widest">Upload</span>
          </button>
        </div>
      </div>
    </div>
  );
}
