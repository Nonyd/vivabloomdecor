import Stripe from "stripe";
import { getSetting } from "@/lib/settings";

let cachedKey: string | null = null;
let _stripe: Stripe | null = null;

export async function getStripe(): Promise<Stripe> {
  const secretKey = await getSetting("stripe_secret_key");
  if (!secretKey) {
    throw new Error("Stripe secret key not configured. Go to Admin → Settings → Payments.");
  }
  if (_stripe && cachedKey === secretKey) {
    return _stripe;
  }
  cachedKey = secretKey;
  _stripe = new Stripe(secretKey, { typescript: true });
  return _stripe;
}

export async function getStripePublishableKey(): Promise<string> {
  return getSetting("stripe_publishable_key");
}

export async function getStripeWebhookSecret(): Promise<string> {
  return getSetting("stripe_webhook_secret");
}
