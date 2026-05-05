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

  const messengerUrl = settings?.storeInfo?.siMessengerUrl || "";
  const fallback = "besimple75";
  const path = messengerUrl.replace("@", "").trim() || fallback;
  const url = messengerUrl.startsWith("http") ? messengerUrl : `https://m.me/${path}`;

  const bottomClass = shifted ? "max-md:bottom-[19rem] md:bottom-[19rem]" : "bottom-44 max-md:bottom-44 md:bottom-[7.25rem]";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-5 md:right-8 z-[9999] flex items-center justify-center w-14 h-14 rounded-full bg-[#0084FF] text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300 group ${bottomClass}`}
      aria-label="Chat on Messenger"
    >
      <FaFacebookMessenger className="w-7 h-7" />
      <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
        Messenger
      </span>
    </a>
  );
}
