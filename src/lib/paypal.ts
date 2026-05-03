import { getSetting } from "@/lib/settings";

export async function getPayPalBase(): Promise<string> {
  const override = process.env.PAYPAL_API_BASE;
  if (override) return override;
  const mode = await getSetting("paypal_mode");
  if (mode === "live") {
    return "https://api-m.paypal.com";
  }
  if (mode === "sandbox") {
    return "https://api-m.sandbox.paypal.com";
  }
  return process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalToken(): Promise<string> {
  const clientId = await getSetting("paypal_client_id");
  const clientSecret = await getSetting("paypal_client_secret");
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured. Go to Admin → Settings → Payments.");
  }
  const base = await getPayPalBase();
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(data.error ?? "PayPal token failed");
  }
  return data.access_token;
}

/** @deprecated Use getPayPalToken */
export async function getPayPalAccessToken(): Promise<string> {
  return getPayPalToken();
}

/** @deprecated Use getPayPalBase */
export async function getPayPalApiBase(): Promise<string> {
  return getPayPalBase();
}

export async function getPayPalClientId(): Promise<string> {
  return getSetting("paypal_client_id");
}
