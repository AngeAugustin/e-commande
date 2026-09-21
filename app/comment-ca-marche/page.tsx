import Link from "next/link";
import type { Metadata } from "next";

import {
  HOW_IT_WORKS_DETAILS,
  ORDER_STATUS_GUIDE,
} from "@/lib/how-it-works";
import { RESTAURANT_LOCATION, RESTAURANT_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Comment ça marche | ${RESTAURANT_NAME}`,
  description:
    "Découvrez comment commander en ligne, payer par MoMo et suivre votre commande chez Dossou - Yovo.",
};

export default function CommentCaMarchePage() {
  return (
    <div className="space-y-10 sm:space-y-14">
      <header className="kitchen-grain relative overflow-hidden rounded-3xl border border-border bg-surface px-5 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-chili/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-0 h-40 w-40 rounded-full bg-palm/10 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-chili">
            Guide client
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-palm sm:text-5xl">
            Comment ça marche
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
            Commander en ligne chez nous, c’est simple&nbsp;: choisissez, payez
            par MoMo, suivez, puis récupérez à {RESTAURANT_LOCATION}.
          </p>
          <Link
            href="/menu"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-chili px-7 py-3.5 text-sm font-bold text-white transition hover:bg-chili-hover"
          >
            Voir le menu
          </Link>
        </div>
      </header>

      <section>
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-chili">
          Le parcours
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-palm sm:text-3xl">
          Quatre étapes, sans surprise.
        </h2>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2">
          {HOW_IT_WORKS_DETAILS.map((item) => (
            <li
              key={item.step}
              className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
            >
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-palm/15">
                {item.step}
              </p>
              <h3 className="mt-2 text-lg font-bold text-palm">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl border border-border bg-palm-deep px-5 py-10 text-white sm:px-10 sm:py-12">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-saffron/90">
          Statuts
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
          Lire l’avancement de votre commande
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
          Sur la page Suivi ou votre ticket, le statut change au fur et à
          mesure. Voici ce que chaque étape signifie.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {ORDER_STATUS_GUIDE.map((status) => (
            <li
              key={status.key}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-saffron">
                {status.label}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                {status.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-border bg-surface px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-palm sm:text-3xl">
              Prêt à commander&nbsp;?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Ouvrez le menu, ou retrouvez une commande déjà passée avec son
              code sur Suivi.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center rounded-full bg-chili px-7 py-3.5 text-sm font-bold text-white transition hover:bg-chili-hover"
            >
              Commander
            </Link>
            <Link
              href="/suivi"
              className="inline-flex items-center justify-center rounded-full border border-border bg-surface-muted px-7 py-3.5 text-sm font-bold text-palm transition hover:border-palm/30 hover:bg-palm/5"
            >
              Suivre une commande
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
