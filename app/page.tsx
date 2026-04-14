import Link from "next/link";

export default function Home() {
  return (
    <section className="mosaic-bg rounded-3xl border border-zinc-200 bg-white px-6 py-16 shadow-sm sm:px-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="inline-flex w-fit rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600">
          Restaurant local premium
        </div>
        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Commandez vos plats ILOSIWAJU en quelques secondes.
        </h1>
        <p className="max-w-2xl text-base text-zinc-600 sm:text-lg">
          Une experience fluide, elegante et rapide, pensee pour le mobile et pour
          un service local fiable.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/menu"
            className="rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Voir le menu
          </Link>
          <Link
            href="/suivi"
            className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-center text-sm font-semibold text-black transition hover:border-zinc-500"
          >
            Suivre une commande
          </Link>
        </div>
      </div>
    </section>
  );
}
