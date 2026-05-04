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

  // Fallback to a default number if settings haven't loaded yet to ensure button is visible
  const finalUrl = whatsappUrl || `https://wa.me/8801700000000`; 

  return (
    <a
      href={finalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed ${shifted ? 'bottom-[228px]' : 'bottom-10'} right-12 md:right-8 z-[10000] flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-300`}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
