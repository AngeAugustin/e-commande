import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STEPS: OrderStatus[] = ["en_attente", "paye", "pret"];

function stepIndex(status: OrderStatus) {
  const i = STEPS.indexOf(status);
  return i < 0 ? 0 : i;
}

/** Barre d'etapes minimale (texte + points), sans cartes. */
export function OrderProgressTrack({ status }: { status: OrderStatus }) {
  const current = stepIndex(status);

  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
      {STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="flex items-center gap-2">
            {index > 0 ? (
              <span className="mx-1 hidden text-mist sm:inline" aria-hidden>
                —
              </span>
            ) : null}
            <span
              className={cn(
                "inline-flex items-center gap-1.5",
                active && "font-semibold text-chili",
                done && "text-palm",
                !done && !active && "text-ink-muted",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  active && "bg-chili",
                  done && "bg-palm",
                  !done && !active && "bg-border",
                )}
                aria-hidden
              />
              {ORDER_STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
