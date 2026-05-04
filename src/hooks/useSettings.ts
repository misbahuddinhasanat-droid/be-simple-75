import { useQuery } from "@tanstack/react-query";

export interface StoreSettings {
  gtmId: string;
  pixelId: string;
  storeInfo: {
    whatsappNumber: string;
    whatsappUrl: string;
    instagramHandle: string;
    instagramUrl: string;
    facebookUrl: string;
    email: string;
    policyReturn: string;
    policyDelivery: string;
    policyPayment: string;
  };
}

export function useSettings() {
  return useQuery<StoreSettings>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    }
  });
}
