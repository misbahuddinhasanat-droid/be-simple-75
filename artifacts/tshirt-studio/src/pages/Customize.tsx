import { useState, useRef, useEffect } from "react";
import { useListProducts, useUploadDesign, useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

type BodyType = "slim" | "medium" | "oversized";
type Gender = "man" | "woman";

export default function Customize() {
  const [, setLocation] = useLocation();
  const { data: products } = useListProducts({ category: "T-Shirts" });
  const uploadDesign = useUploadDesign();
  const addCartItem = useAddCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [bodyType, setBodyType] = useState<BodyType>("medium");
  const [gender, setGender] = useState<Gender>("man");
  const [shirtColor, setShirtColor] = useState<string>("white");
  const [size, setSize] = useState<string>("M");
  const [quantity, setQuantity] = useState(1);
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseProduct = products?.[0]; // Default to the first t-shirt

  useEffect(() => {
    if (baseProduct && !shirtColor) {
      setShirtColor(baseProduct.colors[0]);
    }
    if (baseProduct && !size) {
      setSize(baseProduct.sizes[0]);
    }
  }, [baseProduct, shirtColor, size]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image smaller than 5MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      
      try {
        const result = await uploadDesign.mutateAsync({
          data: {
            imageData: base64,
            filename: file.name
          }
        });
        setDesignUrl(result.url);
        toast({ title: "Design uploaded", description: "Your design looks great!" });
      } catch (err) {
        toast({ title: "Upload failed", description: "Something went wrong uploading your design.", variant: "destructive" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddToCart = () => {
    if (!baseProduct) return;
    
    addCartItem.mutate({
      data: {
        productId: baseProduct.id,
        size,
        color: shirtColor,
        quantity,
        customDesignUrl: designUrl
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Added to Bag", description: "Your custom design is in the bag." });
        setLocation("/cart");
      }
    });
  };

  const getBodyWidth = () => {
    if (bodyType === "slim") return gender === "man" ? "160px" : "140px";
    if (bodyType === "medium") return gender === "man" ? "200px" : "180px";
    return gender === "man" ? "260px" : "240px"; // oversized
  };

  const getShoulderWidth = () => {
    if (bodyType === "slim") return gender === "man" ? "200px" : "180px";
    if (bodyType === "medium") return gender === "man" ? "240px" : "210px";
    return gender === "man" ? "300px" : "270px"; // oversized
  };

  const getWaistWidth = () => {
    if (gender === "woman") {
      if (bodyType === "slim") return "120px";
      if (bodyType === "medium") return "150px";
      return "200px";
    }
    return getBodyWidth(); // Men generally straighter
  };

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tighter">The Studio</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-4">Upload your design, choose your fit, make it yours.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Canvas Area */}
        <div className="lg:col-span-7 xl:col-span-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg h-[600px] md:h-[700px] flex items-center justify-center relative overflow-hidden">
          
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur text-xs font-bold px-3 py-1 rounded uppercase tracking-wider shadow-sm">
              Preview Mode
            </div>
          </div>

          {/* The Figure SVG/Div composite */}
          <div className="relative flex flex-col items-center transition-all duration-500 ease-in-out">
            {/* Head */}
            <div className="w-24 h-32 bg-zinc-300 dark:bg-zinc-700 rounded-[40px] mb-2 transition-all duration-500 z-0"></div>
            
            {/* Neck */}
            <div className="w-12 h-8 bg-zinc-300 dark:bg-zinc-700 z-0"></div>

            {/* The Shirt / Torso */}
            <div 
              className="relative rounded-t-2xl rounded-b-md transition-all duration-500 shadow-xl z-10 flex flex-col items-center justify-start overflow-hidden"
              style={{
                width: getShoulderWidth(),
                height: bodyType === "oversized" ? "320px" : "280px",
                backgroundColor: shirtColor.toLowerCase() === 'white' ? '#f8f9fa' : 
                                shirtColor.toLowerCase() === 'black' ? '#18181b' : 
                                shirtColor.toLowerCase(),
                border: shirtColor.toLowerCase() === 'white' ? '1px solid #e4e4e7' : 'none'
              }}
            >
              {/* Collar shadow/cutout */}
              <div className="w-20 h-6 rounded-b-[50%] bg-zinc-300 dark:bg-zinc-700 absolute top-0 mix-blend-multiply opacity-30"></div>
              
              {/* Waist curve for women */}
              {gender === "woman" && (
                <div 
                  className="absolute bottom-0 w-[120%] h-1/2 bg-transparent pointer-events-none transition-all duration-500"
                  style={{
                    boxShadow: `inset ${bodyType === 'oversized' ? '10px' : '20px'} 0 20px -20px rgba(0,0,0,0.5), inset -${bodyType === 'oversized' ? '10px' : '20px'} 0 20px -20px rgba(0,0,0,0.5)`,
                  }}
                />
              )}

              {/* Uploaded Design Canvas */}
              <div className="mt-16 w-3/5 aspect-square max-h-[60%] flex items-center justify-center relative border border-dashed border-primary/20 bg-primary/5 rounded">
                {designUrl ? (
                  <img src={designUrl} alt="Your design" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-primary/40 text-xs font-bold uppercase tracking-widest text-center px-4">
                    Design Area
                  </span>
                )}
                {uploadDesign.isPending && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* Arms */}
            <div className="absolute top-[168px] left-1/2 -translate-x-1/2 flex justify-between transition-all duration-500 z-0 pointer-events-none"
                 style={{ width: `calc(${getShoulderWidth()} + ${bodyType === 'oversized' ? '60px' : '40px'})` }}>
              {/* Left Arm / Sleeve */}
              <div 
                className="w-12 h-32 rounded-l-xl origin-top-right transition-all duration-500"
                style={{ 
                  backgroundColor: shirtColor.toLowerCase() === 'white' ? '#f8f9fa' : 
                                   shirtColor.toLowerCase() === 'black' ? '#18181b' : 
                                   shirtColor.toLowerCase(),
                  borderLeft: shirtColor.toLowerCase() === 'white' ? '1px solid #e4e4e7' : 'none',
                  borderBottom: shirtColor.toLowerCase() === 'white' ? '1px solid #e4e4e7' : 'none',
                  transform: `rotate(${bodyType === 'oversized' ? '20deg' : '15deg'}) translateY(10px)` 
                }}
              >
                <div className="w-8 h-40 bg-zinc-300 dark:bg-zinc-700 absolute top-full left-1/2 -translate-x-1/2 -z-10 rounded-full"></div>
              </div>
              
              {/* Right Arm / Sleeve */}
              <div 
                className="w-12 h-32 rounded-r-xl origin-top-left transition-all duration-500"
                style={{ 
                  backgroundColor: shirtColor.toLowerCase() === 'white' ? '#f8f9fa' : 
                                   shirtColor.toLowerCase() === 'black' ? '#18181b' : 
                                   shirtColor.toLowerCase(),
                  borderRight: shirtColor.toLowerCase() === 'white' ? '1px solid #e4e4e7' : 'none',
                  borderBottom: shirtColor.toLowerCase() === 'white' ? '1px solid #e4e4e7' : 'none',
                  transform: `rotate(-${bodyType === 'oversized' ? '20deg' : '15deg'}) translateY(10px)` 
                }}
              >
                <div className="w-8 h-40 bg-zinc-300 dark:bg-zinc-700 absolute top-full left-1/2 -translate-x-1/2 -z-10 rounded-full"></div>
              </div>
            </div>

            {/* Legs */}
            <div className="flex gap-4 mt-2 z-0 relative pointer-events-none" style={{ width: getWaistWidth() }}>
              <div className="flex-1 h-64 bg-zinc-300 dark:bg-zinc-700 rounded-b-full"></div>
              <div className="flex-1 h-64 bg-zinc-300 dark:bg-zinc-700 rounded-b-full"></div>
            </div>
            
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8">
          
          {/* Upload Control */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-display font-bold uppercase tracking-wider mb-4">Artwork</h3>
            
            {designUrl ? (
              <div className="flex items-center justify-between p-4 border rounded bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded flex items-center justify-center border overflow-hidden">
                    <img src={designUrl} alt="Uploaded" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="text-sm font-medium">Custom Design</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setDesignUrl(null)} className="text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="font-bold text-sm">Click to upload artwork</p>
                <p className="text-xs text-muted-foreground mt-1">PNG or JPG, up to 5MB</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/png, image/jpeg" 
                  className="hidden" 
                />
              </div>
            )}
          </div>

          {/* Model Controls */}
          <div className="bg-card border rounded-lg p-6 space-y-6">
            <div>
              <h3 className="font-display font-bold uppercase tracking-wider mb-3">Model Gender</h3>
              <div className="grid grid-cols-2 gap-2">
                {(["man", "woman"] as Gender[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`h-12 border rounded-md font-bold uppercase text-sm transition-all ${
                      gender === g 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-input hover:border-foreground'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold uppercase tracking-wider mb-3">Fit Style</h3>
              <div className="grid grid-cols-3 gap-2">
                {(["slim", "medium", "oversized"] as BodyType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setBodyType(type)}
                    className={`h-12 border rounded-md font-bold uppercase text-xs transition-all ${
                      bodyType === type 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-input hover:border-foreground'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Controls */}
          <div className="bg-card border rounded-lg p-6 space-y-6">
            <div>
              <h3 className="font-display font-bold uppercase tracking-wider mb-3">Garment Color</h3>
              <div className="flex flex-wrap gap-3">
                {baseProduct?.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setShirtColor(color)}
                    className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all ${shirtColor === color ? 'border-primary scale-110' : 'border-transparent hover:scale-105 shadow-sm'}`}
                    style={{ 
                      backgroundColor: color.toLowerCase() === 'white' ? '#f8f9fa' : 
                                      color.toLowerCase() === 'black' ? '#18181b' : 
                                      color.toLowerCase()
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-3">
                <h3 className="font-display font-bold uppercase tracking-wider">Size</h3>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {baseProduct?.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-10 border rounded-md font-bold uppercase text-sm transition-all ${
                      size === s 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-input hover:border-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full h-16 font-bold uppercase tracking-widest text-lg"
            onClick={handleAddToCart}
            disabled={!baseProduct || addCartItem.isPending}
          >
            {addCartItem.isPending ? "Adding..." : `Add to Bag - $${baseProduct?.price.toFixed(2) || '0.00'}`}
          </Button>

        </div>
      </div>
    </div>
  );
}
