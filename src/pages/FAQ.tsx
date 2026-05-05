import { ArrowLeft, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useSettings } from "@/hooks/useSettings";

export default function FAQ() {
  const { data: settings } = useSettings();
  const wa = settings?.storeInfo?.whatsappUrl || "#";
  const faqs = [
    { q: "How long does delivery take?", a: "Inside Dhaka, we deliver within 24-48 hours. Outside Dhaka, it usually takes 3-5 business days via our courier partners." },
    { q: "Do you have a return policy?", a: "Yes! We offer a 7-day exchange policy for size issues or manufacturing defects. Items must be unworn and in original packaging." },
    { q: "How can I track my order?", a: "Once your order is confirmed, you can track it in your Customer Dashboard or enter your Order ID on our 'Track Order' page." },
    { q: "Is the print quality permanent?", a: "We use high-grade screen and DTF printing that is built to last through hundreds of washes without fading or cracking." },
    { q: "Do you take custom orders?", a: "Absolutely! Head over to our 'Studio' section to upload your own design and create your custom streetwear." },
    { q: "What payment methods do you accept?", a: "We accept Cash on Delivery (COD), bKash, Nagad, and all major cards via our secure checkout." }
  ];

  return (
    <div className="min-h-screen pb-20" style={{ background: "#050508", color: "#f5f6fa" }}>
      <div className="container px-4 md:px-8 pt-32 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-3 h-3" /> Back to Store
        </Link>

        <div className="text-center mb-16">
          <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: "#ff1744" }}>Support Center</p>
          <h1 className="font-black text-5xl md:text-7xl uppercase tracking-tighter text-white italic">Frequently Asked <br /><span className="gradient-text">Questions</span></h1>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.details 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-3xl transition-all duration-300 overflow-hidden" 
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,23,68,0.1)" }}
            >
              <summary className="flex items-center justify-between p-8 cursor-pointer list-none list-inside outline-none">
                <h3 className="text-sm md:text-base font-black uppercase tracking-wide text-white group-hover:text-rose-400 transition-colors">{faq.q}</h3>
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center transition-transform duration-300 group-open:rotate-180">
                  <MessageCircle className="w-4 h-4 text-slate-500" />
                </div>
              </summary>
              <div className="px-8 pb-8 pt-2">
                <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">{faq.a}</p>
              </div>
            </motion.details>
          ))}
        </div>

        <div className="mt-20 p-12 rounded-[40px] text-center relative overflow-hidden" style={{ background: "rgba(255,23,68,0.03)", border: "1px solid rgba(255,23,68,0.1)" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent pointer-events-none" />
          <h2 className="text-2xl font-black uppercase text-white mb-4 italic">Still have questions?</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm">Message us on WhatsApp — we reply as fast as the courier rolls.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-ai px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <Link href="/contact">
              <span className="btn-ai-outline px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest inline-flex cursor-pointer">Contact form</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
