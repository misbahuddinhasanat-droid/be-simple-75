import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface CartItem {
  id: string;
  productId: number;
  productName: string;
  productImageUrl: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "@besimple_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY)
      .then((raw) => {
        if (raw) setItems(JSON.parse(raw));
      })
      .catch(() => {});
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    AsyncStorage.setItem(CART_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "id">) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) =>
            i.productId === item.productId &&
            i.size === item.size &&
            i.color === item.color,
        );
        let next: CartItem[];
        if (existing) {
          next = prev.map((i) =>
            i.id === existing.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          );
        } else {
          const newItem: CartItem = {
            ...item,
            id:
              Date.now().toString() +
              Math.random().toString(36).substring(2, 9),
          };
          next = [...prev, newItem];
        }
        AsyncStorage.setItem(CART_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const removeItem = useCallback(
    (id: string) => {
      const next = items.filter((i) => i.id !== id);
      persist(next);
    },
    [items, persist],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        const next = items.filter((i) => i.id !== id);
        persist(next);
      } else {
        const next = items.map((i) => (i.id === id ? { ...i, quantity } : i));
        persist(next);
      }
    },
    [items, persist],
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
