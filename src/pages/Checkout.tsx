import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateOrder } from "@/lib/api";
import { useGetCart, getGetCartQueryKey, CART_KEY } from "@/lib/cart-store";
import { useLocation, Link } from "wouter";
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
import { Loader2, ShieldCheck, Zap, Ticket, CreditCard, ShoppingBag } from "lucide-react";
import { useCallback, useRef, useState, useMemo, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

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

import { pushPixelEvent } from "@/hooks/useGTM";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading: isCartLoading } = useGetCart();
  
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      pushPixelEvent("InitiateCheckout", {
        content_ids: cart.items.map(i => i.productId),
        content_type: "product",
        value: cart.total,
        currency: "BDT",
        num_items: cart.items.length
      });
    }
  }, [cart]);

  const { data: settings } = useSettings();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

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

  const discountAmount = useMemo(() => {
    if (!appliedPromo || !settings?.storeInfo?.siPromoDiscountPercent) return 0;
    const pct = parseInt(settings.storeInfo.siPromoDiscountPercent);
    if (isNaN(pct)) return 0;
    return (cart?.total ?? 0) * (pct / 100);
  }, [appliedPromo, cart?.total, settings?.storeInfo?.siPromoDiscountPercent]);

  const finalTotal = (cart?.total ?? 0) - discountAmount;

  const handleApplyPromo = () => {
    setPromoError(null);
    const code = promoInput.trim().toUpperCase();
    const validCode = settings?.storeInfo?.siPromoCode?.trim().toUpperCase();
    
    if (!code) return;
    if (code === validCode) {
      setAppliedPromo(code);
      toast({ title: "Promo Applied!", description: `${settings?.storeInfo?.siPromoDiscountPercent}% discount added.` });
    } else {
      setPromoError("Invalid promo code.");
    }
  };

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
      <div className="bg-[#050508] min-h-screen py-32 flex justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const order = await createOrder.mutateAsync({
        data: {
          customerName: values.customerName,
          email: values.email,
          customerPhone: values.phone,
          address: values.address,
          city: values.city,
          country: values.country,
          zipCode: values.zipCode,
          totalAmount: finalTotal,
          items: cart.items.map(item => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            customDesignUrl: item.customDesignUrl,
          })),
        } as any,
      });

      localStorage.removeItem(CART_KEY);
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
    <div className="bg-[#050508] min-h-screen text-[#f5f6fa] pb-24 selection:bg-rose-500/30">
      <div className="container px-4 py-12 max-w-6xl mx-auto">
        <Link href="/cart" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white mb-10 transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Bag
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <h1 className="font-black text-5xl md:text-7xl uppercase tracking-tighter leading-none text-white">
            Secure <span className="gradient-text">Checkout</span>
          </h1>
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Encrypted Transaction</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7 space-y-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                {/* CONTACT SECTION */}
                <div className="bg-white/2 p-8 rounded-3xl border border-white/10 space-y-8">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <User className="w-5 h-5 text-rose-500" />
                    <h2 className="text-xl font-black uppercase tracking-wider text-white">Contact Info</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-[10px] font-black tracking-widest text-slate-500">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} onChange={(e) => { field.onChange(e); captureLead(); }} className="h-14 bg-white/5 border-white/10 rounded-xl focus-visible:ring-rose-500/50 text-white font-medium" />
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-[10px] font-black tracking-widest text-slate-500">Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="01XXXXXXXXX" type="tel" maxLength={11} {...field} onChange={(e) => { field.onChange(e); captureLead(); }} className="h-14 bg-white/5 border-white/10 rounded-xl focus-visible:ring-rose-500/50 text-white font-medium font-mono" />
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-[10px] font-black tracking-widest text-slate-500">Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" type="email" {...field} onChange={(e) => { field.onChange(e); captureLead(); }} className="h-14 bg-white/5 border-white/10 rounded-xl focus-visible:ring-rose-500/50 text-white font-medium" />
                        </FormControl>
                        <FormMessage className="text-rose-500" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* SHIPPING SECTION */}
                <div className="bg-white/2 p-8 rounded-3xl border border-white/10 space-y-8">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Truck className="w-5 h-5 text-rose-500" />
                    <h2 className="text-xl font-black uppercase tracking-wider text-white">Shipping Address</h2>
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-[10px] font-black tracking-widest text-slate-500">Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="House #, Road #, Area" {...field} className="h-14 bg-white/5 border-white/10 rounded-xl focus-visible:ring-rose-500/50 text-white font-medium" />
                        </FormControl>
                        <FormMessage className="text-rose-500" />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-[10px] font-black tracking-widest text-slate-500">City</FormLabel>
                          <FormControl>
                            <Input placeholder="Dhaka" {...field} className="h-14 bg-white/5 border-white/10 rounded-xl focus-visible:ring-rose-500/50 text-white font-medium" />
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-[10px] font-black tracking-widest text-slate-500">Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Bangladesh" {...field} className="h-14 bg-white/5 border-white/10 rounded-xl focus-visible:ring-rose-500/50 text-white font-medium" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-[10px] font-black tracking-widest text-slate-500">Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="1200" {...field} className="h-14 bg-white/5 border-white/10 rounded-xl focus-visible:ring-rose-500/50 text-white font-medium" />
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* PAYMENT INFO */}
                <div className="bg-rose-500/5 p-6 rounded-3xl border border-rose-500/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white">Cash on Delivery</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pay ৳{finalTotal.toFixed(0)} when you receive your drop.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="btn-ai w-full h-18 rounded-2xl flex items-center justify-center gap-3 group text-base"
                >
                  {createOrder.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-5 h-5 transition-transform group-hover:scale-125" fill="currentColor" />}
                  {createOrder.isPending ? "Securing Order..." : `Confirm Order — ৳${finalTotal.toFixed(0)}`}
                </button>
              </form>
            </Form>
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="lg:col-span-5">
            <div className="bg-white/2 border border-white/10 rounded-3xl p-8 sticky top-28 space-y-8 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <ShoppingBag className="w-5 h-5 text-rose-500" />
                <h2 className="text-xl font-black uppercase tracking-wider text-white">Your Drop</h2>
              </div>

              <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-6 hide-scrollbar">
                {cart.items.map((item) => (
                  <div key={item.itemId} className="flex gap-4 group">
                    <div className="w-16 aspect-[4/5] bg-white/5 rounded-xl border border-white/10 overflow-hidden shrink-0 relative">
                      <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover object-top" />
                      {item.customDesignUrl && (
                        <div className="absolute inset-0 flex items-center justify-center p-1 mt-2 bg-black/40">
                          <img src={item.customDesignUrl} alt="Custom" className="w-2/3 object-contain" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold uppercase text-[13px] text-white leading-tight mb-1">{item.productName}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.size} / QTY: {item.quantity}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="font-black text-rose-500 text-sm">৳{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* PROMO INPUT */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      placeholder="PROMO CODE" 
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-rose-500/50 transition-all"
                    />
                  </div>
                  <button onClick={handleApplyPromo} className="px-6 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Apply</button>
                </div>
                {promoError && <p className="text-[10px] font-bold text-rose-500 mt-2 uppercase tracking-wider">{promoError}</p>}
                {appliedPromo && <p className="text-[10px] font-bold text-green-500 mt-2 uppercase tracking-wider">Applied: {appliedPromo} (-{settings?.storeInfo?.siPromoDiscountPercent}%)</p>}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-white">৳{cart.total.toFixed(0)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-green-500">
                    <span>Discount</span>
                    <span>-৳{discountAmount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <span>Shipping</span>
                  <span className="text-rose-500">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-white/10">
                <span className="font-black uppercase tracking-widest text-sm text-slate-400">Total</span>
                <span className="font-black text-5xl text-white tracking-tighter">৳{finalTotal.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
