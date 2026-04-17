type FedapayLikeError = {
  message?: string;
  errorMessage?: string;
  httpStatus?: number | null;
  httpResponse?: { status?: number; data?: unknown };
  errors?: unknown;
};

function stringifyErrors(errors: unknown): string | null {
  if (errors === undefined || errors === null) {
    return null;
  }
  try {
    return JSON.stringify(errors).slice(0, 600);
  } catch {
    return String(errors).slice(0, 600);
  }
}

function formatBodyData(data: unknown): string | null {
  if (typeof data === "string") {
    const t = data.trim();
    return t.length ? t.slice(0, 400) : null;
  }
  if (!data || typeof data !== "object") {
    return null;
  }
  const d = data as Record<string, unknown>;
  const msg = typeof d.message === "string" && d.message.trim() ? d.message.trim() : "";
  const errStr = stringifyErrors(d.errors);
  if (msg && errStr) {
    return `${msg} — ${errStr}`;
  }
  if (msg) {
    return msg;
  }
  if (errStr) {
    return errStr;
  }
  try {
    return JSON.stringify(data).slice(0, 400);
  } catch {
    return null;
  }
}

/**
 * Le SDK `fedapay` utilise `ApiConnectionError` qui hérite de `Base`, pas de `Error` :
 * `instanceof Error` est donc faux — il faut lire `message`, `errorMessage`, `httpResponse.data`.
 */
export function formatFedapaySdkError(err: unknown): string {
  if (typeof err === "string" && err.trim()) {
    return err.trim();
  }
  if (!err || typeof err !== "object") {
    return "Paiement indisponible";
  }

  const e = err as FedapayLikeError;
  const status = e.httpStatus ?? e.httpResponse?.status ?? null;

  if (typeof e.errorMessage === "string" && e.errorMessage.trim()) {
    const base = e.errorMessage.trim();
    const extra = stringifyErrors(e.errors);
    return appendHttpStatus(extra ? `${base} — ${extra}` : base, status);
  }

  const fromData = formatBodyData(e.httpResponse?.data);
  if (fromData) {
    return appendHttpStatus(fromData, status);
  }

  if (typeof e.message === "string" && e.message.trim()) {
    const raw = e.message.trim();
    const stripped = raw.replace(/^Request error:\s*/i, "").trim();
    return appendHttpStatus(stripped || raw, status);
  }

  return appendHttpStatus("Paiement indisponible", status);
}

function appendHttpStatus(text: string, status: number | null): string {
  if (status == null || status <= 0) {
    return text;
  }
  if (text.includes(`HTTP ${status}`)) {
    return text;
  }
  return `${text} (HTTP ${status})`;
}
