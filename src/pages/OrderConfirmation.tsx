import { useGetOrder } from "@/lib/api";
import { useParams, Link } from "wouter";
import { CheckCircle2, ArrowRight, Printer, Download, ShoppingBag, Truck, ExternalLink } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { pushPixelEvent } from "@/hooks/useGTM";

export default function OrderConfirmation() {
  const { id } = useParams();
  const { data: order, isLoading } = useGetOrder(Number(id), {
    query: { enabled: !!id, queryKey: [`/api/orders/${id}`] },
  });
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(true);

  useEffect(() => {
    if (order) {
      pushPixelEvent("Purchase", {
        content_ids: order.items.map((i: { productId?: number }) => i.productId),
        content_type: "product",
        value: Number(order.totalAmount || order.total || 0),
        currency: "BDT",
        num_items: order.items.length,
        transaction_id: order.id.toString(),
      });
    }
  }, [order]);

  useEffect(() => {
    if (!order?.id) return;
    let alive = true;
    const url = `${window.location.origin}/track-order?order=${order.id}`;
    import("qrcode")
      .then((QR) =>
        QR.default.toDataURL(url, {
          width: 200,
          margin: 2,
          color: { dark: "#050508ff", light: "#ffffffff" },
        })
      )
      .then((dataUrl) => {
        if (alive) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (alive) setQrDataUrl(null);
      });
    return () => {
      alive = false;
    };
  }, [order?.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = useCallback(() => {
    const node = document.getElementById("order-receipt");
    if (!node || !order) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Be Simple 75 — Order ${order.id}</title>
      <style>body{font-family:system-ui,sans-serif;padding:24px;max-width:640px;margin:0 auto;color:#111}</style></head>
      <body><h1 style="font-size:14px;text-transform:uppercase;letter-spacing:0.15em">Official receipt</h1>${node.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `besimple75-order-${order.id}.html`;
    a.rel = "noopener";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [order]);

  if (isLoading) {
    return (
      <div className="bg-[#050508] min-h-screen text-[#f5f6fa] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 bg-white/5 rounded-full mb-6 border-2 border-white/10" />
          <div className="h-10 bg-white/5 w-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#050508] min-h-screen text-[#f5f6fa] flex items-center justify-center">
        <div className="container py-20 text-center">
          <h1 className="font-black text-5xl uppercase text-white mb-6">Order Not Found</h1>
          <p className="text-slate-400 font-bold uppercase tracking-wider mb-10 text-lg">We could not load this receipt.</p>
          <Link href="/">
            <button className="btn-ai h-16 px-10 rounded-xl text-lg">Return Home</button>
          </Link>
        </div>
      </div>
    );
  }

  const orderTotal =
    typeof order.totalAmount === "number" ? order.totalAmount : typeof order.total === "number" ? order.total : 0;

  return (
    <div className="bg-[#050508] min-h-screen text-[#f5f6fa] pb-28 selection:bg-rose-500/30">
      <div className="container px-4 py-14 md:py-20 max-w-3xl mx-auto text-center print:py-4">
        <div className="print:hidden">
          <div className="mb-10 inline-flex items-center justify-center w-20 h-20 bg-emerald-600/90 text-white rounded-2xl shadow-lg shadow-emerald-900/30">
            <CheckCircle2 className="w-10 h-10" strokeWidth={2.5} />
          </div>
          <h1 className="font-black text-4xl md:text-6xl uppercase tracking-tighter mb-4 text-white leading-tight">
            Thank you — order received
          </h1>
          <p className="text-lg font-bold text-rose-400 uppercase tracking-widest mb-3">Order #{order.id}</p>
          <p className="text-slate-400 text-sm font-medium max-w-md mx-auto mb-2 leading-relaxed">
            We&apos;re preparing your shipment. You&apos;ll get updates at <span className="text-white">{order.email}</span>.
          </p>
          <ul className="text-left max-w-md mx-auto text-[13px] text-slate-500 space-y-2 mb-12 print:hidden">
            <li>• Cash on delivery: have the exact amount ready when the courier calls.</li>
            <li>
              • Track anytime with your order ID + phone on{" "}
              <Link href={`/track-order?order=${order.id}`} className="text-rose-400 underline-offset-2 hover:underline">
                Track order
              </Link>
              .
            </li>
          </ul>
        </div>

        <div
          id="order-receipt"
          className="bg-[#0c0c10] border border-white/10 text-left overflow-hidden mb-10 mx-auto max-w-xl rounded-2xl shadow-xl print:border-zinc-300 print:shadow-none print:bg-white print:text-black"
        >
          <div className="bg-white/5 px-6 py-6 border-b border-white/10 flex justify-between items-center print:bg-transparent print:border-zinc-300">
            <div>
              <h2 className="font-black uppercase tracking-[0.2em] text-xs text-rose-500 mb-1">Official receipt</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 print:text-zinc-600">
                Be Simple 75 — {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center print:hidden">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="space-y-6 mb-10">
              {order.items.map((item: Record<string, unknown>, ix: number) => {
                const itemId = String(item.itemId ?? item.productId ?? `row-${ix}`);
                const qty = Number(item.quantity ?? 1);
                const price = Number(item.price ?? 0);
                const imgSrc = typeof item.productImageUrl === "string" ? item.productImageUrl : "/logo.png";
                return (
                  <div key={itemId} className="flex gap-4 pb-6 border-b border-white/5 print:border-zinc-200">
                    <div className="w-[72px] aspect-[4/5] bg-white/5 rounded-lg border border-white/10 overflow-hidden shrink-0 print:border-zinc-300">
                      <img
                        src={imgSrc}
                        alt={String(item.productName ?? "")}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.currentTarget.src = "/logo.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h4 className="font-black uppercase text-base text-white leading-tight mb-1 print:text-black truncate">
                        {String(item.productName ?? "Product")}
                      </h4>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest print:text-zinc-600">
                        {String(item.color ?? "Black")} / {String(item.size ?? "")} · QTY {qty}
                      </p>
                    </div>
                    <div className="font-black text-rose-500 text-base flex items-center whitespace-nowrap print:text-black">
                      ৳{(price * qty).toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pt-2">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-rose-500 mb-3 flex items-center gap-2">
                  <Truck className="w-3 h-3" /> Ship to
                </p>
                <div className="font-bold uppercase tracking-wider text-[12px] text-slate-300 space-y-1 print:text-zinc-800">
                  <p className="text-white text-sm print:text-black">{order.customerName}</p>
                  <p className="text-slate-400 print:text-zinc-600">{order.customerPhone}</p>
                  <p className="normal-case">{order.address}</p>
                  <p className="normal-case">
                    {order.city} — {order.zipCode}
                  </p>
                </div>
              </div>
              <div className="text-left md:text-right w-full md:w-auto border-t border-white/10 md:border-t-0 pt-6 md:pt-0 print:border-zinc-200">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Total</p>
                <p className="font-black text-4xl text-white print:text-black tracking-tighter">৳{orderTotal.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-rose-600/10 px-6 py-3 text-center border-t border-white/5 print:hidden">
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400/95">Wear simple. Stay bold.</p>
          </div>
        </div>

        {showQr && qrDataUrl && (
          <div className="mb-12 print:hidden">
            <div className="inline-block p-6 rounded-[1.75rem] bg-white/[0.03] border border-white/10">
              <div className="flex flex-col items-center gap-5">
                <div className="bg-white p-3 rounded-xl">
                  <img src={qrDataUrl} alt="Scan to open track order with ID prefilled" className="w-[180px] h-[180px] object-contain" />
                </div>
                <p className="text-[11px] font-semibold text-slate-400 max-w-[240px] leading-snug">
                  Scan to open Track order with your ID filled in — enter the phone number you used at checkout.
                </p>
                <button
                  type="button"
                  onClick={() => setShowQr(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-rose-500 transition-colors"
                >
                  Dismiss QR
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-ai-outline min-h-[3.25rem] px-6 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="btn-ai min-h-[3.25rem] px-8 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
          >
            <Download className="w-4 h-4" /> Download receipt
          </button>
          <Link
            href={`/track-order?order=${order.id}`}
            className="btn-ai-outline min-h-[3.25rem] px-6 rounded-xl inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest border border-white/20 bg-white/5 hover:bg-white/10"
          >
            <ExternalLink className="w-4 h-4" /> Track this order
          </Link>
          <Link
            href="/products"
            className="min-h-[3.25rem] px-6 rounded-xl inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest border border-white/10 text-slate-400 hover:text-white"
          >
            Continue shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          #order-receipt { margin-top: 0; max-width: 100%; }
        }
      `}</style>
    </div>
  );
}
