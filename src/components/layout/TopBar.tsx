import { useSettings } from "@/hooks/useSettings";
import { Zap } from "lucide-react";

export function TopBar() {
  const { data: settings } = useSettings();
  const promoText = settings?.storeInfo?.siPromoBannerText;

  if (!promoText) return null;

  const makeChunk = (id: string) =>
    Array.from({ length: 8 }).map((_, i) => (
      <span key={`${id}-${i}`} className="inline-flex items-center gap-3 shrink-0 px-8">
        <Zap className="w-3.5 h-3.5 fill-white shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{promoText}</span>
      </span>
    ));

  return (
    <div className="bg-rose-600 text-white py-2 overflow-hidden relative z-[60]" aria-live="polite">
      <div className="marquee-track flex w-max">
        <div className="flex shrink-0">{makeChunk("a")}</div>
        <div className="flex shrink-0" aria-hidden>
          {makeChunk("b")}
        </div>
      </div>
      <style>{`
        @keyframes marquee-loop {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-loop 42s linear infinite;
        }
      `}</style>
    </div>
  );
}
