import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, settingsTable } from "../_lib/db.js";
import { eq } from "drizzle-orm";
import { requireAdmin, cors } from "../_lib/admin-auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  const db = getDb();

  if (req.method === "GET") {
    try {
      const rows = await db.select().from(settingsTable);
      const map: Record<string, string> = {};
      for (const r of rows) map[r.key] = r.value;
      return res.json({
        gtmId: map["gtm_id"] ?? "", pixelId: map["pixel_id"] ?? "",
        tiktokPixelId: map["tiktok_pixel_id"] ?? "", ga4MeasurementId: map["ga4_measurement_id"] ?? "",
        bdcourierApiKey: map["bdcourier_api_key"] ?? "",
        pathaoClientId: map["pathao_client_id"] ?? "", pathaoClientSecret: map["pathao_client_secret"] ?? "",
        steadfastApiKey: map["steadfast_api_key"] ?? "", steadfastSecretKey: map["steadfast_secret_key"] ?? "",
        oneclickApiKey: map["oneclick_api_key"] ?? "",
        uddoktapayApiKey: map["uddoktapay_api_key"] ?? "", uddoktapayApiSecret: map["uddoktapay_api_secret"] ?? "",
        sslcommerzStoreId: map["sslcommerz_store_id"] ?? "", sslcommerzPassword: map["sslcommerz_password"] ?? "",
        bkashApiKey: map["bkash_api_key"] ?? "",
        whatsappNumber: map["si_whatsapp_number"] ?? "", smsApiKey: map["sms_api_key"] ?? "",
        instagramUrl: map["si_instagram_url"] ?? "", facebookUrl: map["si_facebook_url"] ?? "",
        twitterUrl: map["twitter_url"] ?? "", tiktokUrl: map["tiktok_url"] ?? "",
        siWhatsappUrl: map["si_whatsapp_url"] ?? "", siInstagramHandle: map["si_instagram_handle"] ?? "",
        siEmail: map["si_email"] ?? "", siPolicyReturn: map["si_policy_return"] ?? "",
        siPolicyDelivery: map["si_policy_delivery"] ?? "", siPolicyPayment: map["si_policy_payment"] ?? "",
        siHeroTitle: map["si_hero_title"] ?? "", siHeroSubtitle: map["si_hero_subtitle"] ?? "",
        siAiKnowledgeBase: map["si_ai_knowledge_base"] ?? "", siMessengerUrl: map["si_messenger_url"] ?? "",
        siPromoCode: map["si_promo_code"] ?? "", siPromoDiscountPercent: map["si_promo_discount_percent"] ?? "0",
        siPromoBannerText: map["si_promo_banner_text"] ?? "", siHeroVideoUrl: map["si_hero_video_url"] ?? "",
      });
    } catch (err) {
      console.error("Failed to get admin settings", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PATCH" || req.method === "POST") {
    try {
      const body = req.body as Record<string, string>;
      const keyMap: Record<string, string> = {
        gtmId: "gtm_id", pixelId: "pixel_id",
        tiktokPixelId: "tiktok_pixel_id", ga4MeasurementId: "ga4_measurement_id",
        bdcourierApiKey: "bdcourier_api_key",
        pathaoClientId: "pathao_client_id", pathaoClientSecret: "pathao_client_secret",
        steadfastApiKey: "steadfast_api_key", steadfastSecretKey: "steadfast_secret_key",
        oneclickApiKey: "oneclick_api_key",
        uddoktapayApiKey: "uddoktapay_api_key", uddoktapayApiSecret: "uddoktapay_api_secret",
        sslcommerzStoreId: "sslcommerz_store_id", sslcommerzPassword: "sslcommerz_password",
        bkashApiKey: "bkash_api_key",
        whatsappNumber: "si_whatsapp_number", smsApiKey: "sms_api_key",
        instagramUrl: "si_instagram_url", facebookUrl: "si_facebook_url",
        twitterUrl: "twitter_url", tiktokUrl: "tiktok_url",
        siWhatsappUrl: "si_whatsapp_url", siInstagramHandle: "si_instagram_handle",
        siEmail: "si_email", siPolicyReturn: "si_policy_return",
        siPolicyDelivery: "si_policy_delivery", siPolicyPayment: "si_policy_payment",
        siHeroTitle: "si_hero_title", siHeroSubtitle: "si_hero_subtitle",
        siAiKnowledgeBase: "si_ai_knowledge_base", siMessengerUrl: "si_messenger_url",
        siPromoCode: "si_promo_code", siPromoDiscountPercent: "si_promo_discount_percent",
        siPromoBannerText: "si_promo_banner_text", siHeroVideoUrl: "si_hero_video_url",
      };
      for (const [bodyKey, dbKey] of Object.entries(keyMap)) {
        if (body[bodyKey] !== undefined) {
          const val = body[bodyKey].trim();
          const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, dbKey));
          if (existing.length > 0) {
            await db.update(settingsTable).set({ value: val, updatedAt: new Date() }).where(eq(settingsTable.key, dbKey));
          } else {
            await db.insert(settingsTable).values({ key: dbKey, value: val });
          }
        }
      }
      return res.json({ success: true });
    } catch (err) {
      console.error("Failed to update settings", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
