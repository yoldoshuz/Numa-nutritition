"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { isApiConfigured } from "@/lib/api/config";
import {
  deleteCart,
  deleteCartItem,
  getCart,
  patchCartItem,
  postCartItem,
} from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import type { ApiCart, ApiCartTotals } from "@/lib/api/types";
import { products as staticProducts } from "@/lib/data/products";
import type { CartLine, CartLineWithProduct, Product } from "@/types";

const STORAGE_KEY = "numa-cart";
const MAX_QUANTITY = 99;

/* ── localStorage mirror ─────────────────────────────────────────────────── */

function readStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
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

const toLines = (cart: ApiCart): CartLine[] =>
  cart.items.map((item) => ({ slug: item.product.slug, quantity: item.quantity }));

/* ── context ─────────────────────────────────────────────────────────────── */

interface CartContextValue {
  lines: CartLine[];
  items: CartLineWithProduct[];
  count: number;
  /**
   * Amount due. Now just `totals.total` — the server prices the basket with the
   * same code that prices the order, so this is what the customer will be
   * charged rather than a client-side guess.
   */
  subtotal: number;
  /** Server-computed money for the whole cart. Never absent. */
  totals: ApiCartTotals;
  /** Per-line server truth, keyed by slug. Empty while offline. */
  lineInfo: Map<string, CartLineInfo>;
  /** Something in the basket cannot be ordered — block checkout on this. */
  hasUnavailable: boolean;
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
  refresh: () => void;
}

/** What the server says about one line, as far as the views care. */
export interface CartLineInfo {
  unitPrice: number | null;
  lineTotal: number | null;
  isAvailable: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);


/**
 * The cart runs against the backend when one is configured and reachable, and
 * against localStorage otherwise. Both modes expose the same surface, so the
 * storefront stays usable — browse, add, review, cash checkout — with the API
 * down; only live stock and online payment need the server.
 *
 * The server cart is a React Query resource: mutations write through and hand
 * their response straight back into the cache, so the stepper never waits on a
 * round-trip and never shows a stale quantity.
 */
export function CartProvider({
  children,
  catalog,
}: {
  children: React.ReactNode;
  /**
   * Server-resolved catalogue. Products carry the backend ids the cart API
   * addresses items by; without them the cart can only run in local mode.
   */
  catalog?: Product[];
}) {
  const queryClient = useQueryClient();
  const serverBacked = isApiConfigured();

  const [localLines, setLocalLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  /**
   * The just-applied change, shown until the server confirms it. Without this
   * the optimistic update is written to `localLines` and then immediately
   * discarded, because `lines` reads from the server snapshot whenever the
   * cart is online — so adding an item appeared to do nothing at all.
   */
  const [optimistic, setOptimistic] = useState<CartLine[] | null>(null);

  useEffect(() => {
    setLocalLines(readStorage());
    setHydrated(true);
  }, []);

  const cartQuery = useQuery({
    queryKey: queryKeys.cart(),
    queryFn: getCart,
    enabled: serverBacked,
    staleTime: 0,
  });

  // A failed cart read means no usable server cart for this session.
  const online = serverBacked && !cartQuery.isError;

  const idBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of catalog ?? []) {
      if (product.id) map.set(product.slug, product.id);
    }
    return map;
  }, [catalog]);

  /**
   * What the basket shows.
   *
   * The server snapshot wins for anything the server knows about, but it must
   * not be allowed to erase a line the server was never told about. A product
   * with no backend id — one resolved from the static catalogue, or reached
   * before the catalogue finished loading — is added locally with no request
   * behind it; reading straight from the server snapshot then dropped it on the
   * very next render, so adding such an item looked like the basket refused it.
   * Worse, the mirror below wrote that empty result back to localStorage, so
   * the line was gone for good.
   *
   * Server lines and local-only lines are therefore merged rather than one
   * replacing the other.
   */
  const lines = useMemo(() => {
    if (optimistic) return optimistic;
    if (!online || !cartQuery.data) return localLines;

    const serverLines = toLines(cartQuery.data);
    const onServer = new Set(serverLines.map((line) => line.slug));
    const localOnly = localLines.filter(
      (line) => !onServer.has(line.slug) && !idBySlug.has(line.slug),
    );

    return localOnly.length ? [...serverLines, ...localOnly] : serverLines;
  }, [optimistic, online, cartQuery.data, localLines, idBySlug]);

  // Keep the mirror current so a mid-session outage does not empty the basket.
  useEffect(() => {
    if (hydrated) writeStorage(lines);
  }, [hydrated, lines]);

  const catalogBySlug = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of staticProducts) map.set(product.slug, product);
    // API products win: they carry ids, live prices and stock.
    for (const product of catalog ?? []) map.set(product.slug, product);
    return map;
  }, [catalog]);

  const optimisticRef = useRef<typeof optimistic>(null);
  optimisticRef.current = optimistic;

  /**
   * Sequence guard for cart writes.
   *
   * Holding down "+" fires a write per press. The responses are independent
   * requests and come back in whatever order the network gives them, and each
   * one used to be written straight into the query cache — so a stale snapshot
   * landing after a fresh one dragged the quantity backwards and the counter
   * visibly walked 1, 2, 3… up to the real number instead of just showing it.
   *
   * `issued` is the ticket taken when a write starts; `settled` is the newest
   * ticket whose response has been accepted. A response older than one already
   * accepted is dropped, and the optimistic projection is only cleared by the
   * last write in flight — so the basket shows the number the customer clicked
   * to, from the first press until the server agrees.
   */
  const issued = useRef(0);
  const settled = useRef(0);

  const writeCart = useMutation({
    mutationFn: (run: () => Promise<ApiCart | null>) => {
      const ticket = ++issued.current;
      return run().then((cart) => ({ cart, ticket }));
    },
    onSuccess: ({ cart, ticket }) => {
      // Superseded by a later write — its response is the current truth.
      if (ticket < settled.current) return;
      settled.current = ticket;

      if (cart) queryClient.setQueryData(queryKeys.cart(), cart);
      else queryClient.invalidateQueries({ queryKey: queryKeys.cart() });

      // Anything still in flight is newer than this response; keep showing the
      // optimistic value until it lands, or the count would flicker back.
      if (ticket === issued.current) setOptimistic(null);
    },
    // A failed write leaves the projection in place: the local mirror is the
    // truth from here on, and snapping the basket back would lose the item.
    onError: () => setLocalLines((current) => optimisticRef.current ?? current),
  });

  /**
   * Applies `next` locally, then writes through when the cart is server-backed
   * and the product has a backend id. A failed write leaves the optimistic
   * state in place rather than snapping the UI back.
   */
  const apply = useCallback(
    (next: CartLine[], run: (() => Promise<ApiCart | null>) | null) => {
      setLocalLines(next);
      // Show the change straight away whether or not a request follows: a
      // product with no backend id still belongs in the basket.
      if (online && run) {
        setOptimistic(next);
        writeCart.mutate(run);
      } else {
        setOptimistic(null);
      }
    },
    [online, writeCart],
  );

  const add = useCallback(
    (slug: string, quantity = 1) => {
      const existing = lines.find((line) => line.slug === slug);
      const next = existing
        ? lines.map((line) =>
            line.slug === slug
              ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + quantity) }
              : line,
          )
        : [...lines, { slug, quantity }];

      const productId = idBySlug.get(slug);
      apply(next, productId ? () => postCartItem(productId, quantity) : null);
    },
    [lines, idBySlug, apply],
  );

  const setQuantity = useCallback(
    (slug: string, quantity: number) => {
      const capped = Math.min(MAX_QUANTITY, quantity);
      const next =
        capped <= 0
          ? lines.filter((line) => line.slug !== slug)
          : lines.map((line) => (line.slug === slug ? { ...line, quantity: capped } : line));

      const productId = idBySlug.get(slug);
      apply(
        next,
        !productId
          ? null
          : capped <= 0
            ? () => deleteCartItem(productId)
            : () => patchCartItem(productId, capped),
      );
    },
    [lines, idBySlug, apply],
  );

  const remove = useCallback(
    (slug: string) => {
      const next = lines.filter((line) => line.slug !== slug);
      const productId = idBySlug.get(slug);
      apply(next, productId ? () => deleteCartItem(productId) : null);
    },
    [lines, idBySlug, apply],
  );

  const clear = useCallback(() => {
    apply([], () => deleteCart().then(() => null));
  }, [apply]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
  }, [queryClient]);

  const items = useMemo(
    () =>
      lines.flatMap((line) => {
        const product = catalogBySlug.get(line.slug);
        return product ? [{ ...line, product }] : [];
      }),
    [lines, catalogBySlug],
  );

  /**
   * Prices and availability per line, straight off the last cart response.
   * Keyed by slug because that is what the local mirror stores; the API item
   * carries its product, so the two line up.
   */
  const serverLines = useMemo(() => {
    const map = new Map<string, CartLineInfo>();
    for (const item of cartQuery.data?.items ?? []) {
      if (!item.product?.slug) continue;
      map.set(item.product.slug, {
        unitPrice: item.unitPrice ?? null,
        lineTotal: item.lineTotal ?? null,
        isAvailable: item.isAvailable,
      });
    }
    return map;
  }, [cartQuery.data]);

  /**
   * Server totals when we have them, a local sum when we do not.
   *
   * The fallback only runs with the API unreachable, where the local catalogue
   * is all there is — it has no discount field, so `price` is the honest
   * number to show. Online, nothing is recomputed here: `total` has to match
   * the order to the tiyin, and a float reduce over the same lines does not.
   */
  const totals = useMemo<ApiCartTotals>(() => {
    const server = cartQuery.data?.totals;
    if (serverBacked && server) return server;

    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    return {
      total,
      totalTiyin: Math.round(total * 100),
      unavailableTotal: 0,
      itemsCount: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [serverBacked, cartQuery.data, items]);

  const hasUnavailable = useMemo(
    () => items.some((item) => serverLines.get(item.slug)?.isAvailable === false),
    [items, serverLines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      items,
      ready: hydrated && (!serverBacked || !cartQuery.isPending),
      pending: writeCart.isPending,
      online,
      count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: totals.total,
      totals,
      lineInfo: serverLines,
      hasUnavailable,
      add,
      setQuantity,
      remove,
      clear,
      refresh,
    }),
    [
      lines,
      items,
      totals,
      serverLines,
      hasUnavailable,
      hydrated,
      serverBacked,
      cartQuery.isPending,
      writeCart.isPending,
      online,
      add,
      setQuantity,
      remove,
      clear,
      refresh,
    ],
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
