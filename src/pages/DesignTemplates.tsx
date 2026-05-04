import { useState } from "react";
import { Link } from "wouter";
import { Heart, Copy } from "lucide-react";

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
  { label: "All", value: "all" },
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
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      <div className="border-b border-[#1a1a1a] py-14 px-6 text-center">
        <h1 className="font-display font-black text-6xl md:text-8xl uppercase tracking-tighter text-white mb-4">
          Design<br className="md:hidden" /> Templates
        </h1>
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm max-w-lg mx-auto">
          Use our back prints as inspiration — or apply one directly to your custom tee
        </p>
      </div>

      <div className="sticky top-[80px] z-20 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="container px-6 py-4 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              className={`flex-shrink-0 px-5 py-2 font-black uppercase tracking-widest text-xs border transition-all ${
                activeCategory === value
                  ? "bg-white text-black border-white"
                  : "border-[#2a2a2a] text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
          <div className="ml-auto flex-shrink-0 text-[11px] font-black uppercase tracking-widest text-zinc-600">
            {filtered.length} templates
          </div>
        </div>
      </div>

      <div className="container px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((template) => {
            const isLiked = likedIds.has(template.id);
            return (
              <div
                key={template.id}
                className="group relative bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#333] transition-all overflow-hidden flex flex-col"
              >
                <div className="aspect-square overflow-hidden bg-[#111] relative">
                  <img
                    src={template.imgSrc}
                    alt={template.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />

                  <button
                    onClick={() => toggleLike(template.id)}
                    className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${
                      isLiked ? "text-[#e63329]" : "text-white/80 hover:text-white"
                    }`}
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={isLiked ? "currentColor" : "none"}
                    />
                  </button>

                  <div className="absolute top-3 left-3">
                    <span className="bg-black/70 backdrop-blur-sm border border-[#2a2a2a] text-[9px] font-black uppercase tracking-widest text-zinc-300 px-2 py-1">
                      {template.category}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col gap-2">
                    <Link
                      href="/customize"
                      className="w-full block text-center bg-[#e63329] hover:bg-white hover:text-black text-white text-[10px] font-black uppercase tracking-widest py-2.5 transition-all"
                    >
                      Use as Reference
                    </Link>
                  </div>
                </div>

                <div className="p-3 flex flex-col gap-1">
                  <p className="font-black uppercase tracking-wide text-xs text-white leading-tight truncate">
                    {template.title}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    {template.designer}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => toggleLike(template.id)}
                      className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide transition-colors ${
                        isLiked ? "text-[#e63329]" : "text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      <Heart
                        className="w-3 h-3"
                        fill={isLiked ? "currentColor" : "none"}
                      />
                      {formatCount(template.likes + (isLiked ? 1 : 0))}
                    </button>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-zinc-600">
                      <Copy className="w-3 h-3" />
                      {formatCount(template.uses)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 border border-[#1a1a1a] p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-black uppercase text-2xl md:text-3xl tracking-tighter text-white">
              Ready to build your own?
            </p>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm mt-2">
              Upload your graphic and see it live on a black tee
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/customize"
              className="bg-[#e63329] hover:bg-white hover:text-black text-white font-black uppercase tracking-widest text-sm px-8 py-4 transition-all"
            >
              Open Studio
            </Link>
            <Link
              href="/products"
              className="border border-[#2a2a2a] hover:border-white text-zinc-400 hover:text-white font-black uppercase tracking-widest text-sm px-8 py-4 transition-all"
            >
              Shop Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
