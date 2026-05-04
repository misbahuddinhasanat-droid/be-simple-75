import { Link } from "wouter";
import { AlertTriangle, ArrowLeft, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#050508" }}>
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20" style={{ background: "radial-gradient(circle, #ff1744 0%, transparent 70%)" }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center relative z-10"
      >
        <div className="w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-8 relative">
          <AlertTriangle className="w-12 h-12 text-rose-500" />
          <div className="absolute -inset-4 bg-rose-500/20 blur-xl rounded-full animate-pulse" />
        </div>

        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-4 italic">404</h1>
        <h2 className="text-xl font-black uppercase tracking-widest text-slate-300 mb-6">Lost in the Studio?</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-10 px-6 uppercase tracking-wide font-bold">The page you're looking for doesn't exist or has been moved to another dimension.</p>

        <div className="flex flex-col gap-4">
          <Link href="/">
            <button className="w-full btn-ai py-4 rounded-2xl flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </button>
          </Link>
          <Link href="/products">
            <button className="w-full btn-ai-outline py-4 rounded-2xl flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" /> Browse Collections
            </button>
          </Link>
        </div>

        <p className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">Be Simple 75 — Premium Store</p>
      </motion.div>
    </div>
  );
}
