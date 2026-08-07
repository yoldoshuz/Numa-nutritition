"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  addCartItem,
  clearCart as clearServerCart,
  fetchCart,
  removeCartItem,
  setCartItemQuantity,
} from "@/lib/api/cart";
import { isApiConfigured } from "@/lib/api/config";
import { products as staticProducts } from "@/lib/data/products";
import type { ApiCart } from "@/lib/api/types";
import type { CartLine, CartLineWithProduct, Product } from "@/types";

const STORAGE_KEY = "numa-cart";
const MAX_QUANTITY = 99;

/**
 * The cart runs against the backend when one is configured and reachable, and
 * against localStorage otherwise. Both modes expose the same surface, so the
 * storefront is fully usable — browse, add, review, and (cash) checkout — even
 * with the API down; only live stock and online payment need the server.
 *
 * Writes are applied optimistically and reconciled with the server response, so
 * the quantity stepper never waits on a round-trip.
 */
type Mode = "local" | "server";

/* ── localStorage mirror ─────────────────────────────────────────────────── */

function readStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (line): line is CartLine =>
        typeof line === "object" &&
        line !== null &&
        typeof (line as CartLine).slug === "string" &&
        typeof (line as CartLine).quantity === "number" &&
        (line as CartLine).quantity > 0,
    );
  } catch {
    return [];
  }
}

function writeStorage(lines: CartLine[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Private mode / quota — the in-memory cart still works for this session.
  }
}

/* ── context ─────────────────────────────────────────────────────────────── */

interface CartContextValue {
  lines: CartLine[];
  items: CartLineWithProduct[];
  count: number;
  subtotal: number;
  /** `false` until the cart has hydrated — prevents an SSR/client mismatch. */
  ready: boolean;
  /** True while a server write is in flight. */
  pending: boolean;
  /** `false` once the backend has proven unreachable; cash checkout only. */
  online: boolean;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  /** Re-reads the server cart, e.g. after returning from a payment provider. */
  refresh: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  catalog,
}: {
  children: React.ReactNode;
  /**
   * Server-resolved catalogue. Products carry the backend ids the cart API
   * addresses items by; without it the cart can only run in local mode.
   */
  catalog?: Product[];
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState<Mode>(() =>
    isApiConfigured() ? "server" : "local",
  );

  // Read inside callbacks without making them depend on the latest render.
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const linesRef = useRef(lines);
  linesRef.current = lines;

  const catalogBySlug = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of staticProducts) map.set(product.slug, product);
    // API products win: they carry ids, live prices and stock.
    for (const product of catalog ?? []) map.set(product.slug, product);
    return map;
  }, [catalog]);

  const idBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of catalog ?? []) {
      if (product.id) map.set(product.slug, product.id);
    }
    return map;
  }, [catalog]);

  const commit = useCallback((next: CartLine[]) => {
    setLines(next);
    writeStorage(next);
  }, []);

  /** Projects a server cart onto local lines, keyed by slug. */
  const applyServerCart = useCallback(
    (cart: ApiCart) => {
      const next = cart.items.map((item) => ({
        slug: item.product.slug,
        quantity: item.quantity,
      }));
      commit(next);
    },
    [commit],
  );

  /** Drops to local mode for the rest of the session. */
  const degrade = useCallback(() => setMode("local"), []);

  /* ── hydrate ───────────────────────────────────────────────────────────── */

  useEffect(() => {
    let cancelled = false;

    const stored = readStorage();
    setLines(stored);

    if (!isApiConfigured()) {
      setReady(true);
      return;
    }

    void (async () => {
      try {
        const cart = await fetchCart();
        if (cancelled) return;
        applyServerCart(cart);
      } catch {
        // Backend unreachable — keep whatever localStorage had and go local.
        if (!cancelled) degrade();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyServerCart, degrade]);

  /* ── mutations ─────────────────────────────────────────────────────────── */

  /**
   * Applies `optimistic` immediately, then runs `write` when the cart is
   * server-backed. A failed write degrades to local mode and keeps the
   * optimistic state rather than snapping the UI back.
   */
  const mutate = useCallback(
    (optimistic: CartLine[], write: (() => Promise<ApiCart | null>) | null) => {
      commit(optimistic);
      if (modeRef.current !== "server" || !write) return;

      setPending(true);
      void (async () => {
        try {
          const cart = await write();
          if (cart) applyServerCart(cart);
        } catch {
          degrade();
        } finally {
          setPending(false);
        }
      })();
    },
    [applyServerCart, commit, degrade],
  );

  const add = useCallback(
    (slug: string, quantity = 1) => {
      const current = linesRef.current;
      const existing = current.find((line) => line.slug === slug);
      const next = existing
        ? current.map((line) =>
            line.slug === slug
              ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + quantity) }
              : line,
          )
        : [...current, { slug, quantity }];

      const productId = idBySlug.get(slug);
      mutate(next, productId ? () => addCartItem(productId, quantity) : null);
    },
    [idBySlug, mutate],
  );

  const setQuantity = useCallback(
    (slug: string, quantity: number) => {
      const current = linesRef.current;
      const capped = Math.min(MAX_QUANTITY, quantity);
      const next =
        capped <= 0
          ? current.filter((line) => line.slug !== slug)
          : current.map((line) => (line.slug === slug ? { ...line, quantity: capped } : line));

      const productId = idBySlug.get(slug);
      if (!productId) {
        mutate(next, null);
        return;
      }
      mutate(
        next,
        capped <= 0
          ? () => removeCartItem(productId)
          : () => setCartItemQuantity(productId, capped),
      );
    },
    [idBySlug, mutate],
  );

  const remove = useCallback(
    (slug: string) => {
      const next = linesRef.current.filter((line) => line.slug !== slug);
      const productId = idBySlug.get(slug);
      mutate(next, productId ? () => removeCartItem(productId) : null);
    },
    [idBySlug, mutate],
  );

  const clear = useCallback(() => {
    mutate([], () => clearServerCart().then(() => null));
  }, [mutate]);

  const refresh = useCallback(() => {
    if (modeRef.current !== "server") return;
    void (async () => {
      try {
        applyServerCart(await fetchCart());
      } catch {
        degrade();
      }
    })();
  }, [applyServerCart, degrade]);

  /* ── derived ───────────────────────────────────────────────────────────── */

  const items = useMemo(
    () =>
      lines.flatMap((line) => {
        const product = catalogBySlug.get(line.slug);
        return product ? [{ ...line, product }] : [];
      }),
    [lines, catalogBySlug],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      items,
      ready,
      pending,
      online: mode === "server",
      count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      refresh,
    }),
    [lines, items, ready, pending, mode, add, setQuantity, remove, clear, refresh],
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
