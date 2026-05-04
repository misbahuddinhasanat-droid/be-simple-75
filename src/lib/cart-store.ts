/**
 * Local cart store — persists to localStorage.
 * Overrides the generated API hooks so "Add to Cart" and "Buy Now" work
 * without a server-side session.
 */

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const CART_KEY = "besimple_cart";

export interface CartItem {
  itemId: string;
  productId: number;
  productName: string;
  productImageUrl: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  customDesignUrl: string | null;
}

export interface LocalCart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

function computeCart(items: CartItem[]): LocalCart {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, total, itemCount };
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

// ─── Query Key (matches existing imports) ────────────────────────────────────
export const getGetCartQueryKey = () => ["/api/cart"] as const;

// ─── useGetCart ───────────────────────────────────────────────────────────────
export function useGetCart() {
  const [cart, setCart] = useState<LocalCart>(() => computeCart(loadCart()));

  useEffect(() => {
    // Sync across tabs
    const sync = () => setCart(computeCart(loadCart()));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return { data: cart, isLoading: false };
}

// ─── useAddCartItem ───────────────────────────────────────────────────────────
type AddItemInput = {
  data: { productId: number; size: string; color?: string; quantity?: number; customDesignUrl?: string };
};

export function useAddCartItem() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const mutate = (
    input: AddItemInput,
    callbacks?: { onSuccess?: () => void; onError?: () => void }
  ) => {
    setIsPending(true);
    try {
      const { productId, size, color = "Black", quantity = 1, customDesignUrl = null } = input.data;
      const items = loadCart();

      // Check if same product+size already in cart
      const existing = items.find(i => i.productId === productId && i.size === size);
      if (existing) {
        existing.quantity += quantity;
      } else {
        // Fetch product info from react-query cache or use a placeholder
        const cachedProducts = queryClient.getQueryData<any[]>(["/api/products"]) ?? [];
        const p = cachedProducts.find((x: any) => x.id === productId);
        items.push({
          itemId: crypto.randomUUID(),
          productId,
          productName: p?.name ?? `Product #${productId}`,
          productImageUrl: p?.imageUrl ?? "",
          size,
          color,
          quantity,
          price: p?.salePrice ?? p?.price ?? 0,
          customDesignUrl,
        });
      }

      saveCart(items);
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      // Also invalidate so useGetCart re-reads
      queryClient.setQueryData(getGetCartQueryKey(), computeCart(items));
      callbacks?.onSuccess?.();
    } catch {
      callbacks?.onError?.();
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}

// ─── useRemoveCartItem ────────────────────────────────────────────────────────
export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const mutate = (
    { itemId }: { itemId: string },
    callbacks?: { onSuccess?: () => void }
  ) => {
    setIsPending(true);
    const items = loadCart().filter(i => i.itemId !== itemId);
    saveCart(items);
    queryClient.setQueryData(getGetCartQueryKey(), computeCart(items));
    callbacks?.onSuccess?.();
    setIsPending(false);
  };

  return { mutate, isPending };
}
