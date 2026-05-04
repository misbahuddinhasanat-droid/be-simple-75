import { MessageCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useEffect, useState } from "react";
import { FaFacebookMessenger } from "react-icons/fa";

export function MessengerFloat() {
  const { data: settings } = useSettings();
  const [shifted, setShifted] = useState(false);

  useEffect(() => {
    const handler = (e: any) => setShifted(e.detail);
    window.addEventListener("sticky-bar", handler);
    return () => window.removeEventListener("sticky-bar", handler);
  }, []);

  const messengerUrl = settings?.storeInfo?.siMessengerUrl || "besimple75";
  const url = messengerUrl.startsWith("http") ? messengerUrl : `https://m.me/${messengerUrl.replace("@", "")}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed ${shifted ? 'bottom-[300px]' : 'bottom-[128px]'} right-12 md:right-8 z-[10000] flex items-center justify-center w-14 h-14 rounded-full bg-[#0084FF] text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300 group`}
      aria-label="Chat on Messenger"
    >
      <FaFacebookMessenger className="w-7 h-7" />
      <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
        Messenger
      </span>
    </a>
  );
}
