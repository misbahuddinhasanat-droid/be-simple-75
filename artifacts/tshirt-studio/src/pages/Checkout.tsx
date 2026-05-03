import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetCart, useCreateOrder, useClearCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  zipCode: z.string().min(2, "ZIP code is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading: isCartLoading } = useGetCart();
  const createOrder = useCreateOrder();
  const clearCart = useClearCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      email: "",
      address: "",
      city: "",
      country: "",
      zipCode: "",
    },
  });

  if (isCartLoading) {
    return <div className="container py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const onSubmit = async (values: FormValues) => {
    if (!cart || cart.items.length === 0) return;

    try {
      const order = await createOrder.mutateAsync({
        data: {
          ...values,
          items: cart.items.map(item => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            customDesignUrl: item.customDesignUrl
          }))
        }
      });

      await clearCart.mutateAsync();
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      
      setLocation(`/order-confirmation/${order.id}`);
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: "There was a problem processing your order.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container px-4 py-12 max-w-6xl mx-auto">
      <Link href="/cart" className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground mb-8 inline-block">
        ← Back to Bag
      </Link>
      
      <h1 className="font-display text-4xl font-black uppercase tracking-tighter mb-10 border-b pb-4">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-card border p-6 rounded-lg space-y-6">
                <h2 className="font-display text-xl font-bold uppercase tracking-wide">Contact Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold tracking-wider">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="h-12 bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold tracking-wider">Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" type="email" {...field} className="h-12 bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-card border p-6 rounded-lg space-y-6">
                <h2 className="font-display text-xl font-bold uppercase tracking-wide">Shipping Address</h2>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold tracking-wider">Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, Apt 4B" {...field} className="h-12 bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold tracking-wider">City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} className="h-12 bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold tracking-wider">Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} className="h-12 bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold tracking-wider">Zip / Postal</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} className="h-12 bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-16 font-bold uppercase tracking-widest text-lg"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {createOrder.isPending ? "Processing..." : `Place Order - $${cart.total.toFixed(2)}`}
              </Button>
            </form>
          </Form>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-6 sticky top-24">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide mb-6">Order Items</h2>
            
            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={item.itemId} className="flex gap-4 py-2">
                  <div className="w-16 h-20 bg-muted rounded overflow-hidden shrink-0 relative">
                    <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    {item.customDesignUrl && (
                      <div className="absolute inset-0 flex items-center justify-center p-1 mt-2">
                        <img src={item.customDesignUrl} alt="Custom" className="w-1/2 object-contain" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <h4 className="font-bold uppercase leading-tight truncate">{item.productName}</h4>
                    <p className="text-muted-foreground mt-1">{item.color} / {item.size}</p>
                    <div className="flex justify-between mt-2">
                      <span>Qty: {item.quantity}</span>
                      <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 pt-4 space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-primary font-bold">Free</span>
              </div>
            </div>
            
            <div className="border-t border-border/50 pt-4 flex justify-between items-end">
              <span className="font-bold uppercase">Total</span>
              <span className="font-display text-2xl font-black">${cart.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
