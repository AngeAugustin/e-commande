import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 text-center">
      <h1 className="text-2xl font-black">Page introuvable</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Le contenu demande n existe pas ou n est plus disponible.
      </p>
      <Link
        href="/"
        className="mt-5 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
      >
        Retour a l accueil
      </Link>
    </section>
  );
}
