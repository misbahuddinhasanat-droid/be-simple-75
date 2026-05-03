import { useGetProduct, useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Paintbrush, Minus, Plus } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: product, isLoading, error } = useGetProduct(Number(id), { 
    query: { enabled: !!id, queryKey: [`/api/products/${id}`] } 
  });
  const addCartItem = useAddCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen">
        <div className="container px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-[#111] animate-pulse border border-[#1f1f1f]"></div>
          <div className="space-y-8 py-8">
            <div className="h-16 bg-[#111] animate-pulse w-3/4"></div>
            <div className="h-10 bg-[#111] animate-pulse w-1/4"></div>
            <div className="h-40 bg-[#111] animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <div className="container px-4 py-20 text-center">
          <h2 className="font-display text-5xl font-black uppercase text-white mb-6">404 - Drop Not Found</h2>
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

  // Set defaults if not selected
  if (!selectedSize && product.sizes.length > 0) setSelectedSize(product.sizes[0]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Selection required",
        description: "Please select a size.",
        variant: "destructive"
      });
      return;
    }

    addCartItem.mutate({
      data: {
        productId: product.id,
        size: selectedSize,
        color: "Black", // All are black
        quantity,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({
          title: "Added to Bag",
          description: `${quantity}x ${product.name} has been added.`,
        });
      }
    });
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-[#f0f0f0] pb-24">
      <div className="container px-4 md:px-8 py-12 lg:py-20">
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
              <span className="text-xs font-black text-white bg-[#e63329] px-3 py-1 uppercase tracking-widest">{product.category}</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-white leading-[0.9]">{product.name}</h1>
            <p className="text-4xl font-black mb-10 text-[#e63329]">${product.price.toFixed(2)}</p>
            
            <div className="prose prose-invert mb-12">
              <p className="text-zinc-400 text-lg leading-relaxed font-medium uppercase tracking-wide">{product.description}</p>
            </div>

            <div className="space-y-10 mb-12">
              {/* Color - Always Black */}
              <div>
                <h3 className="font-black uppercase tracking-widest text-sm mb-4 text-white">Color</h3>
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-none border-2 border-white bg-[#111]" title="Black" />
                  <span className="flex items-center ml-2 text-zinc-400 font-bold uppercase text-sm">Heavyweight Black</span>
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-black uppercase tracking-widest text-sm text-white">Size</h3>
                  <button className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white border-b border-zinc-500 hover:border-white transition-colors pb-0.5">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-14 min-w-[3.5rem] px-4 border-2 font-black uppercase tracking-wider transition-all rounded-none ${
                        selectedSize === size 
                          ? 'border-white bg-white text-black' 
                          : 'border-[#1f1f1f] bg-transparent hover:border-zinc-500 text-zinc-300'
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

            <div className="flex flex-col gap-4 mt-auto">
              <Button 
                size="lg" 
                className="w-full h-16 font-black uppercase tracking-widest text-lg bg-[#e63329] hover:bg-white hover:text-black text-white transition-colors border-2 border-transparent rounded-none"
                onClick={handleAddToCart}
                disabled={addCartItem.isPending}
              >
                {addCartItem.isPending ? "Adding..." : "Add to Bag"}
              </Button>
              
              {product.category === 'T-Shirts' && (
                <Link href="/customize">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full h-16 font-black uppercase tracking-widest text-lg gap-3 border-2 border-[#1f1f1f] bg-transparent hover:bg-[#1f1f1f] hover:text-white text-zinc-300 rounded-none"
                  >
                    <Paintbrush className="w-5 h-5" />
                    Customize This Blank
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
