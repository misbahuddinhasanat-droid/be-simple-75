import { useState } from "react";
import { Link } from "wouter";
import { Heart, Copy, ArrowRight, Zap, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Category = "all" | "anime" | "music" | "gaming" | "street";

interface Template {
  id: string;
  title: string;
  designer: string;
  category: Exclude<Category, "all">;
  imgSrc: string;
  likes: number;
  uses: number;
}

const TEMPLATES: Template[] = [
  { id: "berserk-back", title: "The Black Swordsman", designer: "Be Simple", category: "anime", imgSrc: "/products/berserk-back.jpg", likes: 2841, uses: 9204 },
  { id: "pinkfloyd-back", title: "Dark Side of the Moon", designer: "Be Simple", category: "music", imgSrc: "/products/pinkfloyd-back.jpg", likes: 3120, uses: 11480 },
  { id: "deathnote-back", title: "The Rules — Death Note", designer: "Be Simple", category: "anime", imgSrc: "/products/deathnote-back.jpg", likes: 2207, uses: 7830 },
  { id: "batninja-back", title: "Bat Ninja", designer: "Be Simple", category: "street", imgSrc: "/products/batninja-back.jpg", likes: 1984, uses: 6100 },
  { id: "blessed-back", title: "Blessed Forever — Floral", designer: "Be Simple", category: "street", imgSrc: "/products/blessed-back.jpg", likes: 1650, uses: 4920 },
  { id: "glitters-back", title: "All That Glitters", designer: "Be Simple", category: "street", imgSrc: "/products/glitters-back.jpg", likes: 2390, uses: 8310 },
  { id: "metallica-back", title: "Metallica — Butterfly", designer: "Be Simple", category: "music", imgSrc: "/products/metallica-back.jpg", likes: 4205, uses: 16740 },
  { id: "gameover-back", title: "Game Over — Pixel Skull", designer: "Be Simple", category: "gaming", imgSrc: "/products/gameover-back.jpg", likes: 3010, uses: 12500 },
  { id: "deadly-back", title: "Deadly Alliance Eagle", designer: "Be Simple", category: "street", imgSrc: "/products/deadly-back.jpg", likes: 1780, uses: 5620 },
  { id: "angel-back", title: "Angel Mandala", designer: "Be Simple", category: "street", imgSrc: "/products/angel-back.jpg", likes: 2640, uses: 7900 },
  { id: "blessed2-back", title: "Blessed Forever — Dove", designer: "Be Simple", category: "street", imgSrc: "/products/blessed2-back.jpg", likes: 1430, uses: 4100 },
  { id: "berserk-front", title: "Berserk — Script", designer: "Be Simple", category: "anime", imgSrc: "/products/berserk-front.jpg", likes: 1900, uses: 6800 },
  { id: "pinkfloyd-front", title: "Pink Floyd — Prism Logo", designer: "Be Simple", category: "music", imgSrc: "/products/pinkfloyd-front.jpg", likes: 2200, uses: 8100 },
  { id: "deathnote-front", title: "Death Note — Logo", designer: "Be Simple", category: "anime", imgSrc: "/products/deathnote-front.jpg", likes: 1750, uses: 5900 },
  { id: "batman-front", title: "Batman Symbol", designer: "Be Simple", category: "street", imgSrc: "/products/batman-front.jpg", likes: 3400, uses: 14200 },
  { id: "gameover-front", title: "Game Over — Skull Chest", designer: "Be Simple", category: "gaming", imgSrc: "/products/gameover-front.jpg", likes: 2800, uses: 10400 },
];

const CATEGORIES: { label: string; value: Category }[] = [
  { label: "All Drops", value: "all" },
  { label: "Anime", value: "anime" },
  { label: "Music", value: "music" },
  { label: "Gaming", value: "gaming" },
  { label: "Street", value: "street" },
];

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default function DesignTemplates() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const filtered =
    activeCategory === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "#050508", color: "#f5f6fa" }}>
      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <div className="relative py-24 md:py-32 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(225,29,72,0.1),transparent_50%)]" />
        <div className="container px-4 md:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
          >
             <Zap className="w-3.5 h-3.5" fill="currentColor" /> Inspiration Vault
          </motion.div>
          <h1 className="font-black text-6xl md:text-9xl uppercase tracking-tighter text-white mb-6 italic leading-[0.8]">
            Design<br />Manifesto
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs max-w-2xl mx-auto leading-relaxed">
            Curated visual drops from our studio. Use these as benchmarks or deploy them directly to your custom manifest.
          </p>
        </div>
      </div>

      {/* ── CATEGORY BAR ────────────────────────────────────────── */}
      <div className="sticky top-[72px] z-30 bg-[#050508]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container px-4 md:px-8 py-5 flex items-center justify-between gap-6 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2">
            {CATEGORIES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveCategory(value)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] border transition-all duration-300 ${
                  activeCategory === value
                    ? "bg-rose-600 border-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]"
                    : "border-white/5 text-slate-500 hover:border-white/20 hover:text-white bg-white/2"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600">
            <Layers className="w-4 h-4" />
            {filtered.length} Blueprints Active
          </div>
        </div>
      </div>

      {/* ── GRID SECTION ────────────────────────────────────────── */}
      <div className="container px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((template, idx) => {
              const isLiked = likedIds.has(template.id);
              return (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative flex flex-col rounded-[2.5rem] bg-white/2 border border-white/5 hover:border-rose-500/30 transition-all duration-500 overflow-hidden glass-dark"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-[#0a0a0c] relative">
                    <img
                      src={template.imgSrc}
                      alt={template.title}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-60" />

                    <button
                      onClick={() => toggleLike(template.id)}
                      className={`absolute top-5 right-5 w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-black/20 backdrop-blur-md border border-white/10 ${
                        isLiked ? "text-rose-500" : "text-white/50 hover:text-white"
                      }`}
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={isLiked ? "currentColor" : "none"}
                      />
                    </button>

                    <div className="absolute top-5 left-5">
                      <span className="bg-rose-600 text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-lg">
                        {template.category}
                      </span>
                    </div>

                    <div className="absolute inset-x-5 bottom-5 z-10">
                       <Link href="/customize">
                         <button type="button" className="w-full h-12 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 shadow-2xl transform transition-all duration-300 translate-y-0 opacity-100 md:translate-y-3 md:opacity-90 md:group-hover:translate-y-0 md:group-hover:opacity-100 touch-manipulation">
                           Use in Studio <ArrowRight className="w-3.5 h-3.5" />
                         </button>
                       </Link>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black uppercase tracking-tight text-sm text-white italic truncate max-w-[180px]">
                          {template.title}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1">
                          Ref: {template.designer}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLike(template.id)}
                          className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-colors ${
                            isLiked ? "text-rose-500" : "text-slate-500 hover:text-white"
                          }`}
                        >
                          <Heart className="w-3 h-3" fill={isLiked ? "currentColor" : "none"} />
                          {formatCount(template.likes + (isLiked ? 1 : 0))}
                        </button>
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                          <Copy className="w-3 h-3" />
                          {formatCount(template.uses)}
                        </div>
                      </div>
                      <Zap className="w-3.5 h-3.5 text-rose-500/20" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── CALL TO ACTION ──────────────────────────────────────── */}
        <div className="mt-20 rounded-[3rem] bg-gradient-to-br from-white/5 to-white/2 border border-white/5 p-12 md:p-20 flex flex-col items-center text-center gap-8 relative overflow-hidden glass-dark">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-[100px] pointer-events-none" />
          <div className="max-w-2xl">
            <h2 className="font-black uppercase text-4xl md:text-6xl tracking-tighter text-white italic leading-none mb-6">
              Manifest Your<br />Own Vision.
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
              Upload your own graphic asset and uplink it to a heavyweight drop in real-time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/customize">
              <button className="btn-ai h-16 px-12 rounded-2xl text-xs w-full sm:w-auto">Open Studio</button>
            </Link>
            <Link href="/products">
              <button className="h-16 px-12 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all w-full sm:w-auto">
                Collection
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
