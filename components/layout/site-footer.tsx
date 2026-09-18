import { RESTAURANT_LOCATION, RESTAURANT_NAME, RESTAURANT_TAGLINE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-palm-deep text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 text-sm sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div>
            <p className="font-[family-name:var(--font-display)] text-base font-bold tracking-tight">
              {RESTAURANT_NAME}
            </p>
            <p className="text-xs text-white/70">{RESTAURANT_TAGLINE}</p>
          </div>
          <p className="inline-flex items-start gap-2 text-white/85">
            <svg
              viewBox="0 0 24 24"
              className="mt-0.5 h-4 w-4 shrink-0 text-saffron"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
              <circle cx="12" cy="11" r="2.2" />
            </svg>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wide text-white/55">
                Localisation
              </span>
              <span className="font-medium">{RESTAURANT_LOCATION}</span>
            </span>
          </p>
        </div>
        <p className="text-white/70">Cuisine locale · Commande rapide · Suivi en direct</p>
      </div>
    </footer>
  );
}
