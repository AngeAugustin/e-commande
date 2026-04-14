import Link from "next/link";

export default function CommandeCodeNotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-orange-200 bg-orange-50 p-8 text-center">
      <h1 className="text-2xl font-black text-orange-900">Code de commande introuvable</h1>
      <p className="mt-2 text-sm text-orange-800/90">
        Le code saisi est invalide ou ne correspond a aucune commande.
      </p>
      <p className="mt-1 text-sm text-orange-800/90">
        Verifiez le code recu puis reessayez.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/suivi"
          className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Reessayer un code
        </Link>
        <Link
          href="/"
          className="inline-flex rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800"
        >
          Retour a l accueil
        </Link>
      </div>
    </section>
  );
}
