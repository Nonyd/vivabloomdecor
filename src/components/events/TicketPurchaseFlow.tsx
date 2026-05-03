"use client";

import { useMemo, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, Minus, Plus, User, Mail, Phone } from "lucide-react";

type Step = "select" | "details" | "payment" | "success";

export type SerializableEvent = {
  id: string;
  title: string;
  slug: string;
  date: string;
  ticketPrice: number;
  earlyBirdPrice: number | null;
  earlyBirdEnds: string | null;
  isFree: boolean;
  coverImage: string | null;
  capacity: number;
  ticketsSold: number;
};

interface Props {
  event: SerializableEvent;
  spotsLeft: number;
  soldOut: boolean;
  /** From Admin → Settings (or NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY). */
  stripePublishableKey?: string;
  /** From Admin → Settings (or NEXT_PUBLIC_PAYPAL_CLIENT_ID). */
  paypalClientId?: string;
  showStripeAfterpay?: boolean;
}

export default function TicketPurchaseFlow({
  event,
  spotsLeft,
  soldOut,
  stripePublishableKey,
  paypalClientId: paypalClientIdProp,
  showStripeAfterpay = true,
}: Props) {
  const stripePk =
    stripePublishableKey?.trim() ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "";
  const stripePromise = useMemo(() => (stripePk ? loadStripe(stripePk) : null), [stripePk]);
  const paypalClientId =
    paypalClientIdProp?.trim() || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
  const [step, setStep] = useState<Step>("select");
  const [quantity, setQuantity] = useState(1);
  const [details, setDetails] = useState({ name: "", email: "", phone: "" });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const earlyEnd = event.earlyBirdEnds ? new Date(event.earlyBirdEnds) : null;
  const useEarlyBird =
    event.earlyBirdPrice != null && earlyEnd != null && now < earlyEnd;
  const price = event.isFree ? 0 : useEarlyBird ? event.earlyBirdPrice! : event.ticketPrice;
  const subtotal = event.isFree ? 0 : price * quantity;
  const maxQty = Math.min(10, Math.max(0, spotsLeft));

  if (step === "select") {
    return (
      <div className="space-y-6 rounded-2xl border border-[#EDE8DC] bg-white p-6">
        <div>
          <p className="mb-1 font-body text-[10px] uppercase tracking-[0.2em] text-[#C9A96E]">
            {event.isFree ? "Free Event" : "Ticket Price"}
          </p>
          <p className="font-display text-[40px] italic leading-none text-[#0F0E0C]">
            {event.isFree ? "Free" : `$${price}`}
            {useEarlyBird ? (
              <span className="ml-2 text-[16px] text-[#C9A96E]">Early Bird</span>
            ) : null}
          </p>
          {spotsLeft <= 10 && spotsLeft > 0 ? (
            <p className="mt-1 font-body text-[12px] text-orange-500">Only {spotsLeft} spots left!</p>
          ) : null}
        </div>

        {!soldOut && !event.isFree ? (
          <div>
            <p className="mb-3 font-body text-[12px] uppercase tracking-[0.15em] text-[#4A4843]/50">
              Number of Tickets
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EDE8DC] transition-colors hover:border-[#C9A96E] disabled:opacity-30"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-display text-[28px] italic text-[#0F0E0C]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={quantity >= maxQty}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EDE8DC] transition-colors hover:border-[#C9A96E] disabled:opacity-30"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        ) : null}

        {!event.isFree ? (
          <div className="border-t border-[#EDE8DC] pt-4">
            <div className="flex items-center justify-between">
              <span className="font-body text-[13px] text-[#4A4843]/60">Subtotal</span>
              <span className="font-display text-[22px] italic text-[#0F0E0C]">${subtotal.toFixed(2)}</span>
            </div>
            <p className="mt-1 font-body text-[11px] text-[#4A4843]/40">Afterpay available at checkout</p>
          </div>
        ) : null}

        {soldOut ? (
          <div className="rounded-xl bg-[#F8F5EE] p-4 text-center">
            <p className="font-body text-sm text-[#4A4843]">This event is sold out.</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setStep("details")}
            className="w-full rounded-xl bg-[#C9A96E] py-4 font-body text-[12px] uppercase tracking-[0.2em] text-[#0F0E0C] transition-colors hover:bg-[#E8D5B0]"
          >
            {event.isFree ? "Register for Free" : "Continue to Details"}
          </button>
        )}
      </div>
    );
  }

  if (step === "details") {
    return (
      <div className="space-y-5 rounded-2xl border border-[#EDE8DC] bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[22px] italic text-[#0F0E0C]">Your Details</h3>
          <button
            type="button"
            onClick={() => setStep("select")}
            className="font-body text-[12px] text-[#4A4843]/50 hover:text-[#C9A96E]"
          >
            ← Back
          </button>
        </div>

        {(
          [
            { key: "name" as const, label: "Full Name", icon: User, type: "text", required: true },
            { key: "email" as const, label: "Email Address", icon: Mail, type: "email", required: true },
            { key: "phone" as const, label: "Phone (optional)", icon: Phone, type: "tel", required: false },
          ] as const
        ).map((field) => (
          <div key={field.key}>
            <label className="mb-1.5 flex items-center gap-1.5 font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/60">
              <field.icon size={12} />
              {field.label}
            </label>
            <input
              type={field.type}
              required={field.required}
              value={details[field.key]}
              onChange={(e) => setDetails((d) => ({ ...d, [field.key]: e.target.value }))}
              className="w-full rounded-lg border border-[#EDE8DC] px-4 py-3 font-body text-[14px] text-[#0F0E0C] transition-colors focus:border-[#C9A96E] focus:outline-none"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            if (!details.name || !details.email) return;
            setStep("payment");
          }}
          className="w-full rounded-xl bg-[#C9A96E] py-4 font-body text-[12px] uppercase tracking-[0.2em] text-[#0F0E0C] transition-colors hover:bg-[#E8D5B0]"
        >
          Continue to Payment
        </button>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="space-y-5 rounded-2xl border border-[#EDE8DC] bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[22px] italic text-[#0F0E0C]">Payment</h3>
          <button
            type="button"
            onClick={() => setStep("details")}
            className="font-body text-[12px] text-[#4A4843]/50 hover:text-[#C9A96E]"
          >
            ← Back
          </button>
        </div>

        <div className="rounded-xl bg-[#F8F5EE] p-4">
          <div className="flex justify-between font-body text-[14px] text-[#4A4843]">
            <span>
              {quantity}× {event.title}
            </span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <p className="mt-1 font-body text-[11px] text-[#4A4843]/50">
            {details.name} · {details.email}
          </p>
        </div>

        {!event.isFree ? (
          <div className="space-y-3">
            <p className="font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/50">
              {showStripeAfterpay ? "Pay by Card or Afterpay" : "Pay by Card"}
            </p>
            <button
              type="button"
              onClick={async () => {
                if (!stripePromise) return;
                setLoading(true);
                try {
                  const res = await fetch("/api/tickets/checkout/stripe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      eventId: event.id,
                      quantity,
                      name: details.name,
                      email: details.email,
                      phone: details.phone,
                    }),
                  });
                  const data = (await res.json()) as { url?: string; error?: string };
                  if (data.url) window.location.href = data.url;
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !stripePromise}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0F0E0C] py-3.5 font-body text-[13px] uppercase tracking-[0.15em] text-[#0F0E0C] transition-all hover:bg-[#0F0E0C] hover:text-white disabled:opacity-50"
            >
              <CreditCard size={16} />
              {loading
                ? "Redirecting…"
                : showStripeAfterpay
                  ? "Pay with Card / Afterpay"
                  : "Pay with Card"}
            </button>
          </div>
        ) : null}

        {!event.isFree && paypalClientId ? (
          <div>
            <p className="mb-3 font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/50">
              Or pay with PayPal
            </p>
            <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "AUD" }}>
              <PayPalButtons
                style={{ layout: "vertical", color: "gold", shape: "rect", height: 48 }}
                createOrder={async () => {
                  const res = await fetch("/api/tickets/checkout/paypal/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      eventId: event.id,
                      quantity,
                      name: details.name,
                      email: details.email,
                    }),
                  });
                  const data = (await res.json()) as { orderId?: string };
                  return data.orderId ?? "";
                }}
                onApprove={async (data) => {
                  const res = await fetch("/api/tickets/checkout/paypal/capture", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      paypalOrderId: data.orderID,
                      eventId: event.id,
                      quantity,
                      name: details.name,
                      email: details.email,
                    }),
                  });
                  const json = (await res.json()) as { success?: boolean; orderId?: string };
                  if (json.success && json.orderId) {
                    setOrderId(json.orderId);
                    setStep("success");
                  }
                }}
              />
            </PayPalScriptProvider>
          </div>
        ) : null}

        {event.isFree ? (
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                const res = await fetch("/api/tickets/checkout/free", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    eventId: event.id,
                    quantity: Math.min(quantity, maxQty, 10),
                    name: details.name,
                    email: details.email,
                  }),
                });
                const json = (await res.json()) as { success?: boolean; orderId?: string };
                if (json.success && json.orderId) {
                  setOrderId(json.orderId);
                  setStep("success");
                }
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full rounded-xl bg-[#C9A96E] py-4 font-body text-[12px] uppercase tracking-[0.2em] text-[#0F0E0C] transition-colors hover:bg-[#E8D5B0] disabled:opacity-50"
          >
            {loading ? "Registering…" : "Complete Registration"}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#EDE8DC] bg-white p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-green-200 bg-green-50 text-2xl text-green-600">
        ✓
      </div>
      <h3 className="font-display text-[28px] italic text-[#0F0E0C]">You&apos;re registered!</h3>
      <p className="font-body text-sm leading-relaxed text-[#4A4843]/70">
        Your ticket{quantity > 1 ? "s have" : " has"} been sent to <strong>{details.email}</strong>. Check your
        inbox — each ticket has a QR code for entry.
      </p>
      <div className="h-px bg-[#EDE8DC]" />
      <p className="font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/40">
        Order #{orderId?.slice(-8).toUpperCase()}
      </p>
    </div>
  );
}
