import { useGetCart, useRemoveCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, ArrowRight } from "lucide-react";

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const removeCartItem = useRemoveCartItem();
  const queryClient = useQueryClient();

  const handleRemove = (itemId: string) => {
    removeCartItem.mutate({ itemId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-12 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl font-black uppercase tracking-tighter mb-8">Shopping Bag</h1>
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container px-4 py-24 max-w-2xl mx-auto text-center border-2 border-dashed border-muted rounded-xl my-12">
        <h1 className="font-display text-4xl font-black uppercase tracking-tighter mb-4">Your bag is empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button size="lg" className="w-full sm:w-auto font-bold uppercase tracking-wider">Shop Collection</Button>
          </Link>
          <Link href="/customize">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold uppercase tracking-wider">Open Studio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12 max-w-5xl mx-auto">
      <h1 className="font-display text-4xl font-black uppercase tracking-tighter mb-10 border-b pb-4">Shopping Bag</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.items.map((item) => (
            <div key={item.itemId} className="flex gap-4 md:gap-6 p-4 border rounded-lg bg-card">
              <div className="w-24 md:w-32 aspect-[3/4] bg-muted rounded overflow-hidden relative shrink-0">
                <img 
                  src={item.productImageUrl} 
                  alt={item.productName} 
                  className="w-full h-full object-cover"
                />
                {item.customDesignUrl && (
                  <div className="absolute inset-0 flex items-center justify-center p-2 mt-4">
                    <img src={item.customDesignUrl} alt="Custom design" className="w-1/2 object-contain" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold uppercase tracking-wide leading-tight">{item.productName}</h3>
                    {item.customDesignUrl && (
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider">Custom Design</span>
                    )}
                  </div>
                  <p className="font-bold whitespace-nowrap">${item.price.toFixed(2)}</p>
                </div>
                
                <div className="mt-2 text-sm text-muted-foreground space-y-1">
                  <p>Color: <span className="capitalize">{item.color}</span></p>
                  <p>Size: {item.size}</p>
                  <p>Qty: {item.quantity}</p>
                </div>

                <div className="mt-auto pt-4 flex justify-between items-center">
                  <button 
                    onClick={() => handleRemove(item.itemId)}
                    disabled={removeCartItem.isPending}
                    className="text-sm font-bold text-destructive flex items-center gap-1 hover:underline"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-6 sticky top-24">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-border/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                <span className="font-bold">${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-bold text-primary">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <span className="font-bold uppercase">Estimated Total</span>
              <span className="font-display text-3xl font-black">${cart.total.toFixed(2)}</span>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button size="lg" className="w-full h-14 font-bold uppercase tracking-widest text-base">
                Checkout <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
