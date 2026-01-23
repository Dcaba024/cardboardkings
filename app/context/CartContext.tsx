"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  cartCount: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "ck_cart_items";
const emptySnapshot: CartItem[] = [];

const listeners = new Set<() => void>();
let cachedStorageValue: string | null = null;
let cachedItems: CartItem[] = emptySnapshot;

const notify = () => {
  listeners.forEach((listener) => listener());
};

const readItems = (): CartItem[] => {
  if (typeof window === "undefined") {
    return [];
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === cachedStorageValue) {
    return cachedItems;
  }
  if (!stored) {
    cachedStorageValue = stored;
    cachedItems = emptySnapshot;
    return [];
  }
  try {
    const parsed = JSON.parse(stored) as CartItem[];
    cachedStorageValue = stored;
    cachedItems = Array.isArray(parsed) ? parsed : emptySnapshot;
    return cachedItems;
  } catch {
    cachedStorageValue = stored;
    cachedItems = emptySnapshot;
    return cachedItems;
  }
};

const writeItems = (items: CartItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notify();
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    readItems,
    () => emptySnapshot
  );

  const addItem = (item: Omit<CartItem, "quantity">) => {
    const current = readItems();
    const existing = current.find((entry) => entry.id === item.id);
    if (existing) {
      writeItems(
        current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: 1 } : entry
        )
      );
      return;
    }
    writeItems([...current, { ...item, quantity: 1 }]);
  };

  const removeItem = (id: string) => {
    const current = readItems();
    writeItems(current.filter((entry) => entry.id !== id));
  };

  const clear = () => {
    writeItems([]);
  };

  const value = useMemo(() => {
    const cartCount = items.reduce((total, item) => total + item.quantity, 0);
    return { items, cartCount, addItem, removeItem, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
