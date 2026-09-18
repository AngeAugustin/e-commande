import { CopyOrderCodeButton } from "@/components/commande/copy-order-code-button";
import { MomoPaymentInstructions } from "@/components/commande/momo-payment-instructions";
import {
  COMMANDE_TRACKING_LABELS,
  COMMANDE_TRACKING_STEP_IDS,
  getCommandeStatusBadge,
  getCommandeTrackingStepIndex,
} from "@/lib/commande-tracking";
import type { MomoContact } from "@/lib/contact";
import { RESTAURANT_LOCATION, RESTAURANT_NAME, RESTAURANT_TAGLINE } from "@/lib/constants";
import { formatDateTime, formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderTicketProps = {
  orderCode: string;
  createdAt: string | Date;
  total: number;
  status: OrderStatus;
  paymentStatus?: string | null;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  paid: boolean;
  momoContact: MomoContact | null;
  whatsappNumber: string;
};

function TicketPerforation({ side }: { side: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={`ticket-perf ${side === "top" ? "ticket-perf--top" : "ticket-perf--bottom"}`}
    />
  );
}

export function OrderTicket({
  orderCode,
  createdAt,
  total,
  status,
  paymentStatus,
  customerName,
  customerPhone,
  items,
  paid,
  momoContact,
  whatsappNumber,
}: OrderTicketProps) {
  const statusBadge = getCommandeStatusBadge(status, paymentStatus);
  const currentStepIndex = getCommandeTrackingStepIndex(status, paymentStatus);
  const isReady = status === "pret";

  return (
    <div className="order-ticket mx-auto w-full max-w-md">
      <TicketPerforation side="top" />

      <article className="relative overflow-hidden bg-[#FFFDF8] text-[#13241c] shadow-[0_18px_40px_rgba(6,40,32,0.14)]">
        {/* paper grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative px-5 pb-6 pt-5 sm:px-7">
          <header className="text-center">
            <p className="font-[family-name:var(--font-display)] text-[1.35rem] font-extrabold tracking-tight text-palm sm:text-2xl">
              {RESTAURANT_NAME}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-palm/55">
              {RESTAURANT_TAGLINE}
            </p>
            <p className="mt-2 text-xs text-palm/70">{RESTAURANT_LOCATION}</p>
          </header>

          <div className="my-4 border-t border-dashed border-palm/25" />

          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-palm/50">
                  N° commande
                </p>
                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                  <h1 className="min-w-0 whitespace-nowrap font-[family-name:var(--font-display)] text-[0.95rem] font-extrabold tracking-tight text-palm sm:text-lg">
                    {orderCode}
                  </h1>
                  <CopyOrderCodeButton code={orderCode} />
                </div>
              </div>
              <span
                className={`mt-1 shrink-0 select-none rounded-sm border-2 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] sm:text-[11px] ${
                  statusBadge.tone === "ready"
                    ? "border-palm text-palm"
                    : statusBadge.tone === "paid"
                      ? "border-palm-soft text-palm-soft"
                      : "border-chili text-chili"
                }`}
              >
                {statusBadge.label}
              </span>
            </div>
          </div>

          {!paid ? (
            <>
              <div className="my-5 flex items-center gap-2">
                <span className="h-px flex-1 border-t border-dashed border-palm/30" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-palm/45">
                  Stub paiement
                </span>
                <span className="h-px flex-1 border-t border-dashed border-palm/30" />
              </div>
              <MomoPaymentInstructions
                orderCode={orderCode}
                total={total}
                momoContact={momoContact}
                whatsappNumber={whatsappNumber}
                customerName={customerName}
                customerPhone={customerPhone}
                items={items}
                variant="ticket"
              />
            </>
          ) : null}

          <div className="my-4 border-t border-dashed border-palm/25" />

          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-palm/55">Date</dt>
              <dd className="text-right font-medium tabular-nums">{formatDateTime(createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-palm/55">Client</dt>
              <dd className="max-w-[65%] text-right font-semibold">{customerName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-palm/55">Telephone</dt>
              <dd className="font-medium tabular-nums">{customerPhone}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-palm/55">Service</dt>
              <dd className="font-medium">Retrait sur place</dd>
            </div>
          </dl>

          <div className="my-4 border-t border-dashed border-palm/25" />

          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-palm/50">
            <span>Articles</span>
            <span>Montant</span>
          </div>

          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={`${item.name}-${index}`} className="text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="min-w-0 font-semibold leading-snug">{item.name}</span>
                  <span
                    aria-hidden
                    className="mb-1 flex-1 border-b border-dotted border-palm/30"
                  />
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-palm/55">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t-2 border-double border-palm/30 pt-3">
            <div className="flex items-end justify-between gap-3">
              <span className="font-[family-name:var(--font-display)] text-lg font-bold text-palm">
                Total
              </span>
              <span className="font-[family-name:var(--font-display)] text-2xl font-extrabold tabular-nums text-palm">
                {formatPrice(total)}
              </span>
            </div>
            <p className="mt-1 text-xs text-palm/55">Paiement par depot Mobile Money</p>
          </div>

          <div className="my-5 border-t border-dashed border-palm/25" />

          <div>
            <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-palm/50">
              Suivi cuisine
            </p>
            <ol className="relative grid grid-cols-2 gap-2">
              <div
                aria-hidden
                className={`pointer-events-none absolute left-[25%] right-[25%] top-[18px] h-px border-t border-dashed ${
                  currentStepIndex >= 1 ? "border-palm" : "border-palm/25"
                }`}
              />
              {COMMANDE_TRACKING_STEP_IDS.map((stepId, index) => {
                const isPast = currentStepIndex >= 0 && index < currentStepIndex;
                const isCurrent = currentStepIndex >= 0 && index === currentStepIndex;
                const isAwaitingPayment = !paid && stepId === "paye";
                const isReadyStep = isReady && stepId === "pret";
                const done = isPast || isReadyStep || (isCurrent && stepId === "paye" && paid);
                const active = isAwaitingPayment || (isCurrent && !done);

                return (
                  <li key={stepId} className="relative z-[1] flex flex-col items-center gap-1.5 text-center">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        done
                          ? "border-palm bg-palm text-white"
                          : active
                            ? "border-chili bg-chili/10 text-chili"
                            : "border-palm/20 bg-[#FFFDF8] text-palm/35"
                      }`}
                    >
                      {done ? (
                        <svg
                          aria-hidden
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m8.8 12.3 2.2 2.3 4.2-4.6" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span
                      className={`text-[11px] font-semibold leading-tight sm:text-xs ${
                        done ? "text-palm" : active ? "text-chili" : "text-palm/40"
                      }`}
                    >
                      {COMMANDE_TRACKING_LABELS[stepId]}
                    </span>
                  </li>
                );
              })}
            </ol>

            {isReady ? (
              <p className="mt-4 rounded-lg border border-dashed border-palm/35 bg-palm/5 px-3 py-2.5 text-center text-sm text-palm">
                Votre commande est prete — presente ce code au comptoir.
              </p>
            ) : null}
          </div>

          <p className="mt-6 text-center font-[family-name:var(--font-display)] text-sm italic text-palm/60">
            Merci — a bientot au comptoir
          </p>
        </div>
      </article>

      <TicketPerforation side="bottom" />
    </div>
  );
}
