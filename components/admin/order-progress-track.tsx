import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STEPS: OrderStatus[] = ["en_attente", "paye", "pret"];

function stepIndex(status: OrderStatus) {
  const i = STEPS.indexOf(status);
  return i < 0 ? 0 : i;
}

/**
 * Index de la dernière étape validée.
 * - en_attente : aucune (on attend encore le dépôt)
 * - paye / pret : l’étape courante est considérée comme atteinte (donc cochée)
 */
function completedThroughIndex(status: OrderStatus) {
  if (status === "en_attente") return -1;
  return stepIndex(status);
}

/** Stepper horizontal pour la fiche commande admin. */
export function OrderProgressTrack({ status }: { status: OrderStatus }) {
  const completedThrough = completedThroughIndex(status);
  const nextIndex = completedThrough + 1;

  return (
    <ol className="grid grid-cols-3 gap-2">
      {STEPS.map((step, index) => {
        const done = index <= completedThrough;
        const active = !done && index === nextIndex;
        return (
          <li key={step} className="relative flex flex-col items-center gap-2 text-center">
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-[15px] h-0.5",
                  index < completedThrough ? "bg-palm" : "bg-border",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-[1] inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold",
                done && "border-palm bg-palm text-white",
                active && "border-chili bg-chili/10 text-chili",
                !done && !active && "border-border bg-surface text-ink-muted",
              )}
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
              className={cn(
                "text-[11px] font-semibold leading-tight sm:text-xs",
                done && "text-palm",
                active && "text-chili",
                !done && !active && "text-ink-muted",
              )}
            >
              {ORDER_STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
