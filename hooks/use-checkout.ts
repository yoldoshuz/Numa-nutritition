"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { checkoutErrorKey, newIdempotencyKey } from "@/lib/api/checkout";
import { getPaymentUrl, postCheckout } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import type { CheckoutPayload, PaymentMethod } from "@/lib/api/types";

import { useCart } from "./use-cart";

type Phase = "idle" | "submitting" | "redirecting";

/**
 * Places the order and, for online methods, hands the customer off to the
 * provider's hosted checkout.
 *
 * The idempotency key is held across retries so a double submit — or a retry
 * after a network error whose request actually landed — cannot create a second
 * order. It is regenerated only once a failure is known to be terminal.
 */
export function useCheckout() {
  const { clear, refresh } = useCart();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>("idle");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const idempotencyKey = useRef(newIdempotencyKey());

  const mutation = useMutation({
    mutationFn: async ({
      payload,
      method,
    }: {
      payload: Omit<CheckoutPayload, "idempotencyKey">;
      method: PaymentMethod;
    }) => {
      setPhase("submitting");
      const { order } = await postCheckout({
        ...payload,
        paymentMethod: method,
        idempotencyKey: idempotencyKey.current,
      });
      return { order, method };
    },
    onSuccess: async ({ order, method }) => {
      // Checkout consumes the server cart; mirror that locally either way.
      clear();
      queryClient.removeQueries({ queryKey: queryKeys.cart() });

      if (method === "cash") {
        // Nothing left to confirm — the order stands and is paid on delivery.
        setOrderId(order.id);
        setPhase("idle");
        return;
      }

      // Deliberately not setting orderId for an online method. It is what
      // renders the "order placed" screen, and at this point nothing has been
      // paid: the customer is about to be handed to the provider. Only the
      // provider's server-to-server callback settles it, so the answer is read
      // back on /payment/return rather than assumed here.
      setPhase("redirecting");
      try {
        const { url } = await getPaymentUrl(order.id, method);
        window.location.href = url;
      } catch {
        // The order exists and its stock is reserved; only the redirect failed,
        // so the customer must not be told the purchase did not happen.
        setErrorKey("errorPayment");
        setPhase("idle");
      }
    },
    onError: (error) => {
      setErrorKey(checkoutErrorKey(error));
      setPhase("idle");
      // A 409 means someone else took the stock — resync so the cart tells the
      // truth before the customer tries again.
      refresh();
      idempotencyKey.current = newIdempotencyKey();
    },
  });

  return {
    phase,
    errorKey,
    orderId,
    busy: phase !== "idle",
    /** Set before submitting so the form can clear a stale message. */
    setErrorKey,
    submit: mutation.mutate,
  };
}
