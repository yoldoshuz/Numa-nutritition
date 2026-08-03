"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import { getProduct, products } from "@/lib/data/products";
import type { CartLine, CartLineWithProduct } from "@/types";

const STORAGE_KEY = "numa-cart";

/* -------------------------------------------------------------------------
 * External store. Keeping the cart outside React lets every consumer read it
 * through `useSyncExternalStore`, which stays hydration-safe without the
 * setState-in-effect pattern.
 * ---------------------------------------------------------------------- */

const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function readStorage(): CartLine[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;

    const valid = parsed
      .filter(
        (line): line is CartLine =>
          typeof line === "object" &&
          line !== null &&
          typeof (line as CartLine).slug === "string" &&
          typeof (line as CartLine).quantity === "number"
      )
      .filter((line) => products.some((product) => product.slug === line.slug));

    return valid.length > 0 ? valid : EMPTY;
  } catch {
    return EMPTY;
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  lines = readStorage();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);

  // Keep other tabs in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    lines = readStorage();
    listeners.forEach((notify) => notify());
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): CartLine[] {
  hydrate();
  return lines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota — the in-memory cart still works for this session.
  }
  listeners.forEach((notify) => notify());
}

/* ---------------------------------------------------------------------- */

interface CartContextValue {
  lines: CartLine[];
  items: CartLineWithProduct[];
  count: number;
  subtotal: number;
  /** `false` until the client store has hydrated — prevents SSR flicker. */
  ready: boolean;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const add = useCallback((slug: string, quantity = 1) => {
    const existing = lines.find((line) => line.slug === slug);
    commit(
      existing
        ? lines.map((line) =>
            line.slug === slug
              ? { ...line, quantity: Math.min(99, line.quantity + quantity) }
              : line
          )
        : [...lines, { slug, quantity }]
    );
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    commit(
      quantity <= 0
        ? lines.filter((line) => line.slug !== slug)
        : lines.map((line) =>
            line.slug === slug ? { ...line, quantity: Math.min(99, quantity) } : line
          )
    );
  }, []);

  const remove = useCallback((slug: string) => {
    commit(lines.filter((line) => line.slug !== slug));
  }, []);

  const clear = useCallback(() => commit(EMPTY), []);

  const items = useMemo(
    () =>
      current.flatMap((line) => {
        const product = getProduct(line.slug);
        return product ? [{ ...line, product }] : [];
      }),
    [current]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines: current,
      items,
      ready,
      count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      ),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [current, items, ready, add, setQuantity, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return context;
}
