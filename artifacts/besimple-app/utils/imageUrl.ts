const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";

export function getImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  return `https://${DOMAIN}${url}`;
}
