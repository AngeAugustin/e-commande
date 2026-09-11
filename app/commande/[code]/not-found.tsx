import Link from "next/link";

export default function CommandeCodeNotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-chili/25 bg-chili/5 p-8 text-center">
      <h1 className="text-2xl font-extrabold text-chili">Code de commande introuvable</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Le code saisi est invalide ou ne correspond à aucune commande.
      </p>
      <p className="mt-1 text-sm text-ink-muted">
        Vérifiez le code reçu puis réessayez.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/suivi"
          className="inline-flex rounded-xl bg-chili px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(224,69,26,0.35)] transition hover:bg-chili-hover"
        >
          Réessayer un code
        </Link>
        <Link
          href="/"
          className="inline-flex rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-palm transition hover:border-palm/30"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </section>
  );
}
