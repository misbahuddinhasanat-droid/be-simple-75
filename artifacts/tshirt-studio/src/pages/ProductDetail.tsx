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
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-[3/4] bg-muted animate-pulse rounded-md"></div>
        <div className="space-y-8">
          <div className="h-12 bg-muted animate-pulse w-3/4 rounded"></div>
          <div className="h-8 bg-muted animate-pulse w-1/4 rounded"></div>
          <div className="h-32 bg-muted animate-pulse w-full rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container px-4 py-20 text-center">
        <h2 className="font-display text-3xl font-bold uppercase">Product not found</h2>
        <p className="mt-4 text-muted-foreground">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products">
          <Button className="mt-8">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  // Set defaults if not selected
  if (!selectedSize && product.sizes.length > 0) setSelectedSize(product.sizes[0]);
  if (!selectedColor && product.colors.length > 0) setSelectedColor(product.colors[0]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: "Selection required",
        description: "Please select a size and color.",
        variant: "destructive"
      });
      return;
    }

    addCartItem.mutate({
      data: {
        productId: product.id,
        size: selectedSize,
        color: selectedColor,
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
    <div className="container px-4 md:px-8 py-12 lg:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Product Image */}
        <div className="aspect-[3/4] overflow-hidden rounded-md bg-muted sticky top-24">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm font-bold text-primary uppercase tracking-widest">{product.category}</div>
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">{product.name}</h1>
          <p className="text-2xl font-medium mb-8">${product.price.toFixed(2)}</p>
          
          <div className="prose prose-zinc dark:prose-invert mb-10">
            <p>{product.description}</p>
          </div>

          <div className="space-y-8 mb-10">
            {/* Color Selection */}
            <div>
              <div className="flex justify-between mb-3">
                <h3 className="font-bold uppercase tracking-wider text-sm">Color</h3>
                <span className="text-muted-foreground text-sm capitalize">{selectedColor}</span>
              </div>
              <div className="flex gap-3">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all ${selectedColor === color ? 'border-primary scale-110' : 'border-transparent hover:scale-105'}`}
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

            {/* Size Selection */}
            <div>
              <div className="flex justify-between mb-3">
                <h3 className="font-bold uppercase tracking-wider text-sm">Size</h3>
                <button className="text-xs underline text-muted-foreground hover:text-foreground">Size Guide</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 border rounded-md font-bold uppercase transition-all ${
                      selectedSize === size 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-input hover:border-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-3">Quantity</h3>
              <div className="flex items-center border border-input rounded-md w-32">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center font-bold">{quantity}</div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-auto">
            <Button 
              size="lg" 
              className="w-full h-14 font-bold uppercase tracking-widest text-base"
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
                  className="w-full h-14 font-bold uppercase tracking-widest text-base gap-2"
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
  );
}
