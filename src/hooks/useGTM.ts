import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

let gtmLoaded = false;

export function useGTM() {
  useEffect(() => {
    if (gtmLoaded) return;

    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: { gtmId?: string; pixelId?: string }) => {
        const { gtmId, pixelId } = data;

        // ── Google Tag Manager ─────────────────────────────────────
        if (gtmId && gtmId.startsWith("GTM-")) {
          gtmLoaded = true;
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
          const script = document.createElement("script");
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
          document.head.appendChild(script);

          const noscript = document.createElement("noscript");
          const iframe = document.createElement("iframe");
          iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
          iframe.height = "0"; iframe.width = "0"; iframe.style.display = "none"; iframe.style.visibility = "hidden";
          noscript.appendChild(iframe);
          document.body.prepend(noscript);
        }

        // ── Meta Pixel ─────────────────────────────────────────────
        if (pixelId && !window.fbq) {
          const pixelScript = document.createElement("script");
          pixelScript.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `;
          document.head.appendChild(pixelScript);

          const noscriptPixel = document.createElement("noscript");
          noscriptPixel.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
          document.body.prepend(noscriptPixel);
        }
      })
      .catch(() => {});
  }, []);
}

// Push custom events to GTM dataLayer
export function pushGTMEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({ event, ...data });
  }
}

// Push Meta Pixel events
export function pushPixelEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, data);
  }
}
