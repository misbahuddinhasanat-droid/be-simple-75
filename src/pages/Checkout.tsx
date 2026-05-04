import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetCart, useCreateOrder, useClearCart, getGetCartQueryKey } from "@/lib/api";
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
import { useCallback, useRef } from "react";

const formSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Enter a valid BD number (e.g. 01XXXXXXXXX)")
    .min(11, "Phone number required"),
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
  const leadSavedRef = useRef(false);
  const leadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      country: "Bangladesh",
      zipCode: "",
    },
  });

  // Silently capture incomplete checkout lead as soon as phone is valid
  const captureLead = useCallback(() => {
    const values = form.getValues();
    const phone = values.phone.replace(/\s/g, "");
    if (!/^01[3-9]\d{8}$/.test(phone)) return;

    if (leadTimerRef.current) clearTimeout(leadTimerRef.current);
    leadTimerRef.current = setTimeout(() => {
      const cartItems = cart?.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })) ?? [];

      fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone,
          name: values.customerName || "",
          email: values.email || "",
          cartItems,
          cartTotal: cart?.total ?? 0,
        }),
      }).catch(() => {});
      leadSavedRef.current = true;
    }, 800);
  }, [form, cart]);

  if (isCartLoading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen py-32 flex justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#e63329]" />
      </div>
    );
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
          customerName: values.customerName,
          email: values.email,
          address: values.address,
          city: values.city,
          country: values.country,
          zipCode: values.zipCode,
          items: cart.items.map(item => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            customDesignUrl: item.customDesignUrl,
          })),
        },
      });

      await clearCart.mutateAsync();
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      setLocation(`/order-confirmation/${order.id}`);
    } catch {
      toast({
        title: "Checkout failed",
        description: "There was a problem processing your order.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-[#f0f0f0] pb-24">
      <div className="container px-4 py-16 max-w-6xl mx-auto">
        <Link href="/cart" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white mb-8 inline-block transition-colors">
          ← Back to Bag
        </Link>

        <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter mb-12 border-b-2 border-[#1f1f1f] pb-6 text-white">
          Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* ── Contact ─────────────────────────────────── */}
                <div className="bg-[#050505] border-2 border-[#1f1f1f] p-8 space-y-8">
                  <h2 className="font-display text-2xl font-black uppercase tracking-wider text-white border-b-2 border-[#1f1f1f] pb-3">
                    Contact
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-[10px] font-black tracking-widest text-zinc-400">Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              {...field}
                              onChange={(e) => { field.onChange(e); captureLead(); }}
                              className="h-14 bg-[#111] border-[#1f1f1f] rounded-none focus-visible:ring-white text-white font-medium"
                            />
                          </FormControl>
                          <FormMessage className="text-[#e63329]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-[10px] font-black tracking-widest text-zinc-400">
                            Phone Number <span className="text-[#e63329]">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="01XXXXXXXXX"
                              type="tel"
                              maxLength={11}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                captureLead();
                              }}
                              className="h-14 bg-[#111] border-[#1f1f1f] rounded-none focus-visible:ring-white text-white font-medium font-mono"
                            />
                          </FormControl>
                          <FormMessage className="text-[#e63329]" />
                          <p className="text-[10px] text-zinc-600 mt-1">We'll confirm your order via phone call</p>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-[10px] font-black tracking-widest text-zinc-400">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john@example.com"
                            type="email"
                            {...field}
                            onChange={(e) => { field.onChange(e); captureLead(); }}
                            className="h-14 bg-[#111] border-[#1f1f1f] rounded-none focus-visible:ring-white text-white font-medium"
                          />
                        </FormControl>
                        <FormMessage className="text-[#e63329]" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ── Shipping ─────────────────────────────────── */}
                <div className="bg-[#050505] border-2 border-[#1f1f1f] p-8 space-y-8">
                  <h2 className="font-display text-2xl font-black uppercase tracking-wider text-white border-b-2 border-[#1f1f1f] pb-3">
                    Shipping
                  </h2>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-[10px] font-black tracking-widest text-zinc-400">Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, Apt 4B" {...field} className="h-14 bg-[#111] border-[#1f1f1f] rounded-none focus-visible:ring-white text-white font-medium" />
                        </FormControl>
                        <FormMessage className="text-[#e63329]" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-[10px] font-black tracking-widest text-zinc-400">City</FormLabel>
                          <FormControl>
                            <Input placeholder="Dhaka" {...field} className="h-14 bg-[#111] border-[#1f1f1f] rounded-none focus-visible:ring-white text-white font-medium" />
                          </FormControl>
                          <FormMessage className="text-[#e63329]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-[10px] font-black tracking-widest text-zinc-400">Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Bangladesh" {...field} className="h-14 bg-[#111] border-[#1f1f1f] rounded-none focus-visible:ring-white text-white font-medium" />
                          </FormControl>
                          <FormMessage className="text-[#e63329]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-[10px] font-black tracking-widest text-zinc-400">Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="1200" {...field} className="h-14 bg-[#111] border-[#1f1f1f] rounded-none focus-visible:ring-white text-white font-medium" />
                          </FormControl>
                          <FormMessage className="text-[#e63329]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-16 font-black uppercase tracking-widest text-xl bg-[#e63329] hover:bg-white hover:text-black text-white transition-colors rounded-none border-2 border-transparent"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : null}
                  {createOrder.isPending ? "Processing..." : `Place Order — ৳${cart.total.toFixed(0)}`}
                </Button>
              </form>
            </Form>
          </div>

          {/* ── Order Summary ─────────────────────────────── */}
          <div className="lg:col-span-5">
            <div className="bg-[#050505] border-2 border-[#1f1f1f] p-8 sticky top-28">
              <h2 className="font-display text-2xl font-black uppercase tracking-wider mb-8 text-white border-b-2 border-[#1f1f1f] pb-3">
                Your Drop
              </h2>

              <div className="space-y-6 mb-8">
                {cart.items.map((item) => (
                  <div key={item.itemId} className="flex gap-4 py-2 border-b border-[#1f1f1f]/50 pb-6">
                    <div className="w-20 aspect-[4/5] bg-[#111] border border-[#1f1f1f] overflow-hidden shrink-0 relative">
                      <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover object-top" />
                      {item.customDesignUrl && (
                        <div className="absolute inset-0 flex items-center justify-center p-1 mt-2 bg-black/40">
                          <img src={item.customDesignUrl} alt="Custom" className="w-2/3 object-contain" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-black uppercase tracking-wide text-white leading-tight mb-1">{item.productName}</h4>
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Black / {item.size}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400">QTY: {item.quantity}</span>
                        <span className="font-black text-[#e63329]">৳{(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 text-sm mb-6 font-bold uppercase tracking-wider border-b-2 border-[#1f1f1f] pb-6">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">৳{cart.total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>
                  <span className="text-[#e63329]">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="font-black uppercase tracking-widest text-zinc-400">Total</span>
                <span className="font-display text-4xl font-black text-white">৳{cart.total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
