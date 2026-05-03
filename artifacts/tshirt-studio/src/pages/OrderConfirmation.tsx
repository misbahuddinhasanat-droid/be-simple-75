import { useGetOrder } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function OrderConfirmation() {
  const { id } = useParams();
  const { data: order, isLoading } = useGetOrder(Number(id), {
    query: { enabled: !!id, queryKey: [`/api/orders/${id}`] }
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-muted rounded-full mb-4"></div>
          <div className="h-8 bg-muted w-48 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-3xl font-bold uppercase">Order not found</h1>
        <Link href="/">
          <Button className="mt-8">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 py-16 md:py-24 max-w-3xl mx-auto text-center">
      <div className="mb-10 inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      
      <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4">It's Official.</h1>
      <p className="text-xl text-muted-foreground mb-2">Order #{order.id} has been placed.</p>
      <p className="text-muted-foreground mb-12">We've sent a confirmation email to {order.email}</p>

      <div className="bg-card border rounded-xl text-left overflow-hidden mb-12">
        <div className="bg-zinc-100 dark:bg-zinc-900 px-6 py-4 border-b">
          <h2 className="font-bold uppercase tracking-wider text-sm">Order Summary</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6 mb-8">
            {order.items.map((item) => (
              <div key={item.itemId} className="flex gap-4">
                <div className="w-16 h-20 bg-muted rounded overflow-hidden shrink-0 relative">
                  <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  {item.customDesignUrl && (
                    <div className="absolute inset-0 flex items-center justify-center p-1 mt-2">
                      <img src={item.customDesignUrl} alt="Custom" className="w-1/2 object-contain" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-bold uppercase text-sm leading-tight">{item.productName}</h4>
                  <p className="text-muted-foreground text-xs mt-1">{item.color} / {item.size} / Qty: {item.quantity}</p>
                </div>
                <div className="font-bold flex items-center">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-6 flex justify-between items-end">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-1">Shipping To</p>
              <p className="text-sm">{order.customerName}</p>
              <p className="text-sm">{order.address}</p>
              <p className="text-sm">{order.city}, {order.zipCode}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-1">Total Paid</p>
              <p className="font-display text-2xl font-black">${order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href="/products">
          <Button size="lg" className="w-full sm:w-auto font-bold uppercase tracking-wider">
            Keep Shopping <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
