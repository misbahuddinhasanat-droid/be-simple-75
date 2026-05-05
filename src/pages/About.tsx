import { Link } from "wouter";
import { ArrowLeft, Zap, ShieldCheck } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

export default function About() {
  useSEO({ title: "About Us", description: "Be Simple 75 — premium streetwear Bangladesh.", path: "/about" });

  return (
    <div className="min-h-screen pb-24" style={{ background: "#050508", color: "#f5f6fa" }}>
      <div className="container px-4 md:px-8 pt-28 max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors mb-10">
          <ArrowLeft className="w-3 h-3" /> Back Home
        </Link>

        <p className="text-[11px] font-black uppercase tracking-widest text-rose-500 mb-3">Bangladesh streetwear</p>
        <h1 className="font-black text-5xl md:text-7xl uppercase tracking-tighter text-white italic leading-[0.95] mb-10">
          About<br />Be Simple 75
        </h1>

        <div className="space-y-6 text-slate-400 text-sm md:text-base leading-relaxed font-medium">
          <p>
            We make heavyweight tees that read loud on the street — anime, music, gaming, and clean minimal drops —
            stitched for Dhaka summers and nightly rides.
          </p>
          <p>
            Every piece is QC’d before dispatch. Cash on delivery is welcome nationwide, and you can customise your print
            from the Studio anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 flex gap-4">
            <Zap className="w-6 h-6 text-rose-500 shrink-0" />
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-white mb-2">Drops</h2>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed">New designs roll out weekly. Follow us for release windows.</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 flex gap-4">
            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-white mb-2">Trust</h2>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Size swaps and defect coverage — see FAQ and Returns for details.</p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-4">
          <Link href="/faq"><button className="btn-ai-outline h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest">FAQs</button></Link>
          <Link href="/contact"><button className="btn-ai h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest">Contact</button></Link>
          <Link href="/track-order"><button className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10">Track Order</button></Link>
        </div>
      </div>
    </div>
  );
}
