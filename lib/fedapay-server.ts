import { FedaPay, Transaction } from "fedapay";

function getSecretKey() {
  const key = process.env.FEDAPAY_SECRET_KEY;
  if (!key?.trim()) {
    throw new Error("FEDAPAY_SECRET_KEY manquant");
  }
  return key.trim();
}

export function getPublicAppUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "")}`;
  }
  return "http://localhost:3000";
}

function normalizeFedapayEnvironment(raw: string | undefined) {
  const v = (raw ?? "sandbox").trim().toLowerCase();
  if (v === "live" || v === "production" || v === "prod") {
    return "live";
  }
  if (v === "sandbox" || v === "test" || v === "dev" || v === "development") {
    return "sandbox";
  }
  return "sandbox";
}

export function configureFedaPay() {
  FedaPay.setApiKey(getSecretKey());
  FedaPay.setEnvironment(normalizeFedapayEnvironment(process.env.FEDAPAY_ENVIRONMENT));
}

/** Indicatif pays ISO (ex. BJ, SN) pour le numéro Mobile Money. */
export function getFedapayPhoneCountry() {
  return (process.env.FEDAPAY_PHONE_COUNTRY ?? "BJ").trim().toUpperCase() || "BJ";
}

/**
 * Numéro sans préfixe pays, chiffres uniquement (attendu par l’API FedaPay).
 */
export function parseFedapayPhoneNumber(raw: string, country: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    throw new Error("Numéro de téléphone invalide");
  }

  const cc: Record<string, string> = {
    BJ: "229",
    SN: "221",
    CI: "225",
    TG: "228",
    NE: "227",
  };

  const prefix = cc[country];
  let local = digits;
  if (prefix && local.startsWith(prefix)) {
    local = local.slice(prefix.length);
  }
  if (local.startsWith("0")) {
    local = local.slice(1);
  }

  const n = Number.parseInt(local, 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("Numéro de téléphone invalide");
  }

  return { number: n, country };
}

export function splitCustomerName(full: string) {
  const t = full.trim();
  if (!t) {
    return { firstname: "Client", lastname: "Commande" };
  }
  const parts = t.split(/\s+/);
  if (parts.length === 1) {
    return { firstname: parts[0], lastname: "-" };
  }
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

export type FedapayPaymentModeEnv = string | undefined;

export function getOptionalFedapayPaymentMode(): FedapayPaymentModeEnv {
  return process.env.FEDAPAY_PAYMENT_MODE?.trim() || undefined;
}

/**
 * Mode de transaction FedaPay : explicite via FEDAPAY_PAYMENT_MODE, sinon en sandbox
 * défaut `momo_test` (voir doc FedaPay — tests sans opérateur réel).
 * En live, définissez FEDAPAY_PAYMENT_MODE (ex. mtn_open, moov_open selon votre compte).
 */
export function getResolvedFedapayMode(): string | undefined {
  const custom = process.env.FEDAPAY_PAYMENT_MODE?.trim();
  if (custom) {
    return custom;
  }
  if (normalizeFedapayEnvironment(process.env.FEDAPAY_ENVIRONMENT) === "sandbox") {
    return "momo_test";
  }
  return undefined;
}

/**
 * Réponse de POST /transactions/:id/token selon les versions d’API (objet plat ou FedaPayObject imbriqué).
 */
export function extractPaymentUrlFromTokenResult(tokenResult: unknown): string {
  if (!tokenResult || typeof tokenResult !== "object") {
    return "";
  }
  const root = tokenResult as Record<string, unknown>;
  const direct = root.url ?? root.payment_url ?? root.paymentUrl;
  if (typeof direct === "string" && direct.startsWith("http")) {
    return direct;
  }
  for (const key of Object.keys(root)) {
    const v = root[key];
    if (!v || typeof v !== "object") {
      continue;
    }
    const nested = v as Record<string, unknown>;
    const u = nested.url ?? nested.payment_url ?? nested.paymentUrl;
    if (typeof u === "string" && u.startsWith("http")) {
      return u;
    }
  }
  try {
    const s = JSON.stringify(tokenResult);
    const m = s.match(/https:\/\/[^"'\s\\]+/);
    if (m?.[0]) {
      return m[0].replace(/\\u002f/gi, "/");
    }
  } catch {
    /* ignore */
  }
  return "";
}

export { Transaction };
