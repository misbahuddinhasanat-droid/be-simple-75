import { useEffect } from "react";

// ─── EDIT THESE CONSTANTS TO MATCH YOUR BRAND ─────────────────────────────
const BASE_URL = "https://besimple75.com"; // ← change to your live domain
const STORE_NAME = "Be Simple 75";
const BASE_TITLE = "Be Simple 75 — Premium Streetwear Bangladesh | ৳599";
const BASE_DESC =
  "Shop premium streetwear t-shirts in Bangladesh. Anime, graphic & oversized tees from ৳599. Fast delivery across Dhaka, Chittagong, Sylhet & all BD.";
const BASE_KEYWORDS =
  "streetwear bangladesh, t-shirt dhaka, anime tshirt bd, graphic tee bangladesh, oversized tshirt, besimple75, be simple 75, streetwear dhaka, tshirt chittagong, premium tshirt bd";
const BASE_IMAGE = "/opengraph.jpg";
// ──────────────────────────────────────────────────────────────────────────

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  path?: string;
  type?: "website" | "product";
  price?: string;
  product?: { name: string; image: string; description: string; price: number };
}

export function useSEO({
  title,
  description,
  keywords,
  image,
  path,
  type = "website",
  product,
}: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${STORE_NAME}` : BASE_TITLE;
    const fullDesc = description ?? BASE_DESC;
    const fullKeywords = keywords ? `${keywords}, ${BASE_KEYWORDS}` : BASE_KEYWORDS;
    const fullImage = image ? `${BASE_URL}${image}` : `${BASE_URL}${BASE_IMAGE}`;
    const fullUrl = path ? `${BASE_URL}${path}` : BASE_URL;

    // Document title
    document.title = fullTitle;

    // Standard meta
    setMeta("description", fullDesc);
    setMeta("keywords", fullKeywords);
    setMeta("robots", "index, follow");
    setMeta("author", STORE_NAME);
    setMeta("language", "Bengali, English");

    // Geo / Location meta (Bangladesh)
    setMeta("geo.region", "BD");
    setMeta("geo.placename", "Dhaka, Bangladesh");
    setMeta("geo.position", "23.8103;90.4125");
    setMeta("ICBM", "23.8103, 90.4125");

    // Open Graph
    setMeta("og:type", type, "property");
    setMeta("og:site_name", STORE_NAME, "property");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", fullDesc, "property");
    setMeta("og:image", fullImage, "property");
    setMeta("og:image:width", "1200", "property");
    setMeta("og:image:height", "630", "property");
    setMeta("og:image:alt", `${STORE_NAME} — Streetwear Bangladesh`, "property");
    setMeta("og:url", fullUrl, "property");
    setMeta("og:locale", "bn_BD", "property");
    setMeta("og:locale:alternate", "en_BD", "property");

    // Twitter / X Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:site", "@besimple75");
    setMeta("twitter:creator", "@besimple75");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", fullDesc);
    setMeta("twitter:image", fullImage);
    setMeta("twitter:image:alt", `${STORE_NAME} — Streetwear Bangladesh`);

    // Product-specific OG (for product pages)
    if (type === "product" && product) {
      setMeta("og:price:amount", String(product.price), "property");
      setMeta("og:price:currency", "BDT", "property");
      setMeta("og:availability", "in stock", "property");
      setMeta("og:brand", STORE_NAME, "property");
    }

    // Canonical URL
    setLink("canonical", fullUrl);

    // Alternate language hreflang
    setLinkHref("alternate", fullUrl, "bn-BD");
    setLinkHref("alternate", fullUrl, "en-BD");

    // JSON-LD structured data
    if (type === "product" && product) {
      setJsonLd("product-ld", {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: `${BASE_URL}${product.image}`,
        brand: { "@type": "Brand", name: STORE_NAME },
        offers: {
          "@type": "Offer",
          priceCurrency: "BDT",
          price: product.price,
          availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: STORE_NAME },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingDestination: { "@type": "DefinedRegion", addressCountry: "BD" },
          },
        },
      });
    } else {
      removeJsonLd("product-ld");
    }
  }, [title, description, keywords, image, path, type, product]);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function setMeta(nameOrProp: string, content: string, attrType: "name" | "property" = "name") {
  let el = document.querySelector(
    `meta[${attrType}="${nameOrProp}"]`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrType, nameOrProp);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setLinkHref(rel: string, href: string, hreflang: string) {
  let el = document.querySelector(
    `link[rel="${rel}"][hreflang="${hreflang}"]`
  ) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    (el as HTMLLinkElement & { hreflang: string }).hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  document.getElementById(id)?.remove();
}
