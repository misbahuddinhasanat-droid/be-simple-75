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
      <div className="bg-[#0a0a0a] min-h-screen text-[#f0f0f0] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 bg-[#111] rounded-full mb-6 border-2 border-[#1f1f1f]"></div>
          <div className="h-10 bg-[#111] w-64 rounded-none"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen text-[#f0f0f0] flex items-center justify-center">
        <div className="container py-20 text-center">
          <h1 className="font-display text-5xl font-black uppercase text-white mb-6">Order Not Found</h1>
          <p className="text-zinc-400 font-bold uppercase tracking-wider mb-10 text-lg">Lost in the void.</p>
          <Link href="/">
            <Button size="lg" className="h-16 px-10 font-black uppercase tracking-widest bg-white text-black hover:bg-zinc-200 rounded-none text-lg">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-[#f0f0f0] pb-24">
      <div className="container px-4 py-16 md:py-24 max-w-4xl mx-auto text-center">
        <div className="mb-12 inline-flex items-center justify-center w-24 h-24 bg-[#e63329] text-white rounded-none rotate-3 hover:rotate-0 transition-transform">
          <CheckCircle2 className="w-12 h-12" strokeWidth={3} />
        </div>
        
        <h1 className="font-display text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 text-white leading-none">Order <br/> Secured</h1>
        <p className="text-xl font-black text-[#e63329] uppercase tracking-widest mb-3">Drop #{order.id}</p>
        <p className="text-zinc-400 font-bold uppercase tracking-wider mb-16 text-sm">Confirmation sent to {order.email}</p>

        <div className="bg-[#050505] border-2 border-[#1f1f1f] text-left overflow-hidden mb-16 mx-auto max-w-3xl">
          <div className="bg-[#111] px-8 py-6 border-b-2 border-[#1f1f1f]">
            <h2 className="font-black uppercase tracking-widest text-lg text-white">Manifest</h2>
          </div>
          <div className="p-8">
            <div className="space-y-8 mb-10">
              {order.items.map((item) => (
                <div key={item.itemId} className="flex gap-6 pb-6 border-b border-[#1f1f1f]/50">
                  <div className="w-24 aspect-[4/5] bg-[#111] border border-[#1f1f1f] overflow-hidden shrink-0 relative">
                    <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover object-top" />
                    {item.customDesignUrl && (
                      <div className="absolute inset-0 flex items-center justify-center p-2 mt-4 bg-black/40">
                        <img src={item.customDesignUrl} alt="Custom" className="w-2/3 object-contain" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-black uppercase text-xl text-white leading-tight mb-2">{item.productName}</h4>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Black / {item.size} / QTY: {item.quantity}</p>
                  </div>
                  <div className="font-black text-[#e63329] text-xl flex items-center">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pt-4">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-3">Destination</p>
                <div className="font-bold uppercase tracking-wider text-sm text-zinc-300 space-y-1">
                  <p className="text-white">{order.customerName}</p>
                  <p>{order.address}</p>
                  <p>{order.city}, {order.zipCode}</p>
                </div>
              </div>
              <div className="text-left md:text-right w-full md:w-auto border-t-2 md:border-t-0 border-[#1f1f1f] pt-6 md:pt-0">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-2">Total</p>
                <p className="font-display text-5xl font-black text-white">${order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link href="/products">
            <Button size="lg" className="w-full sm:w-auto h-16 px-12 font-black uppercase tracking-widest text-lg bg-white text-black hover:bg-zinc-200 border-2 border-transparent rounded-none transition-colors">
              Continue Shopping <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
