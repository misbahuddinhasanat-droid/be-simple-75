import { MessageCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useState, useEffect } from "react";

export function WhatsAppFloat() {
  const { data: settings } = useSettings();
  const whatsappUrl = settings?.storeInfo?.whatsappUrl;
  const [shifted, setShifted] = useState(false);

  useEffect(() => {
    const handler = (e: any) => setShifted(e.detail);
    window.addEventListener("sticky-bar", handler);
    return () => window.removeEventListener("sticky-bar", handler);
  }, []);

  if (!whatsappUrl) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed ${shifted ? 'bottom-[100px]' : 'bottom-6'} right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_4px_12px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_6px_16px_rgba(37,211,102,0.6)] transition-all duration-300 group`}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-full mr-4 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
        Chat with us
        <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-white" />
      </span>
    </a>
  );
}
