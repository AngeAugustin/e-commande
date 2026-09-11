import Image from "next/image";
import Link from "next/link";

import { getWhatsAppHref } from "@/lib/contact";
import { connectToDatabase } from "@/lib/mongodb";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/models/Product";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1800&q=80";

const STEPS = [
  {
    title: "Choisissez",
    text: "Parcourez le menu et ajoutez vos plats au panier.",
  },
  {
    title: "Validez",
    text: "Indiquez livraison ou retrait, puis confirmez.",
  },
  {
    title: "Dégustez",
    text: "Payez par MoMo et suivez votre commande en direct.",
  },
] as const;

export const revalidate = 60;

type FeaturedDish = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

async function getFeaturedDishes(): Promise<FeaturedDish[]> {
  try {
    await connectToDatabase();
    const products = await Product.find({ available: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .select("name description price image")
      .lean();

    return products.map((product) => ({
      id: String(product._id),
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const whatsappHref = getWhatsAppHref(
    "Bonjour, je souhaite passer une commande chez DOSSOU-YOVO.",
  );
  const featured = await getFeaturedDishes();
  const marqueeItems =
    featured.length > 0 ? [...featured, ...featured] : [];

  return (
    <div className="bg-background">
      {/* —— Hero —— */}
      <section className="relative min-h-[min(92vh,820px)] overflow-hidden text-white">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Plat grillé servi chez DOSSOU-YOVO"
            fill
            priority
            className="object-cover object-[center_35%] scale-105 animate-hero- ken"
            sizes="100vw"
          />
          {/* Asymétrie : texte lisible à gauche, photo vivante à droite */}
          <div className="absolute inset-0 bg-gradient-to-r from-palm-deep via-palm-deep/78 to-palm-deep/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-palm-deep via-transparent to-palm-deep/50" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[min(92vh,820px)] w-full max-w-6xl flex-col justify-end px-5 pb-14 pt-28 sm:px-8 sm:pb-20 md:justify-center md:pb-24">
          <p className="animate-fade-up font-[family-name:var(--font-display)] text-[clamp(2.75rem,9vw,6.5rem)] font-bold leading-[0.92] tracking-tight">
            Chez
            <br />
            <span className="relative inline-block">
              DOSSOU-YOVO
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-1.5 w-full origin-left scale-x-100 rounded-full bg-chili animate-underline-draw sm:-bottom-2 sm:h-2"
              />
            </span>
          </p>

          <h1 className="animate-fade-up-delay mt-7 max-w-lg text-xl font-semibold leading-snug text-white/95 sm:mt-8 sm:text-2xl md:text-3xl">
            La cuisine locale, commandée en un geste.
          </h1>

          <p className="animate-fade-up-delay mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
            Menu, paiement MoMo et suivi — pensé pour le téléphone, prêt pour
            votre table.
          </p>

          <div className="animate-fade-up-delay-2 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/menu"
              className="rounded-xl bg-chili px-7 py-3.5 text-center text-sm font-bold text-white shadow-[0_10px_32px_rgba(224,69,26,0.45)] transition hover:bg-chili-hover hover:shadow-[0_12px_36px_rgba(224,69,26,0.55)]"
            >
              Commander maintenant
            </Link>
            <Link
              href="/suivi"
              className="rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Suivre une commande
            </Link>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-background"
        />
      </section>

      {/* —— Parcours —— */}
      <section className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-chili">
          Comment ça marche
        </p>
        <h2 className="mt-3 max-w-xl text-3xl font-bold text-palm sm:text-4xl">
          Trois étapes, puis à table.
        </h2>

        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute top-5 left-[3.25rem] hidden h-px w-[calc(100%-1rem)] bg-border sm:block"
                />
              ) : null}
              <div className="relative flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-palm font-[family-name:var(--font-display)] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    {step.text}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* —— Comptoir (signature) —— */}
      <section className="kitchen-grain border-y border-border/60 bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-chili">
                Au comptoir
              </p>
              <h2 className="mt-3 text-3xl font-bold text-palm sm:text-4xl">
                Ce qu&apos;on prépare ici.
              </h2>
            </div>
            <Link
              href="/menu"
              className="text-sm font-semibold text-chili transition hover:text-chili-hover"
            >
              Voir tout le menu →
            </Link>
          </div>
        </div>

        {featured.length > 0 ? (
          <div className="comptoir-marquee mt-10 overflow-hidden">
            <div className="comptoir-marquee-track flex w-max gap-4 pe-4 sm:gap-5 sm:pe-5">
              {marqueeItems.map((dish, index) => (
                <Link
                  key={`${dish.id}-${index}`}
                  href="/menu"
                  className="group relative w-[78vw] max-w-sm shrink-0 overflow-hidden rounded-3xl sm:w-80"
                  tabIndex={index >= featured.length ? -1 : undefined}
                  aria-hidden={index >= featured.length ? true : undefined}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={dish.image}
                      alt={index >= featured.length ? "" : dish.name}
                      fill
                      sizes="(max-width: 640px) 78vw, 320px"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-palm-deep/90 via-palm-deep/20 to-transparent" />
                    <span className="absolute top-4 right-4 rounded-lg bg-surface px-2.5 py-1 text-xs font-bold text-palm shadow-sm">
                      {formatPrice(dish.price)}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                        {dish.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-white/75">
                        {dish.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="mx-auto mt-10 max-w-6xl px-5 text-sm text-ink-muted sm:px-8">
            Aucun plat disponible pour le moment.{" "}
            <Link href="/menu" className="font-semibold text-chili hover:underline">
              Voir le menu
            </Link>
          </p>
        )}
      </section>

      {/* —— Livraison / Retrait —— */}
      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-16 sm:grid-cols-2 sm:gap-5 sm:px-8 sm:py-20">
        <Link
          href="/menu"
          className="group relative overflow-hidden rounded-3xl bg-palm px-7 py-10 text-white transition hover:bg-palm-soft"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
            Service
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">
            Livraison
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/75">
            Commandez, payez, on vous apporte le repas chaud.
          </p>
          <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-chili transition group-hover:gap-3">
            Commander
            <span aria-hidden>→</span>
          </span>
        </Link>

        <Link
          href="/menu"
          className="group relative overflow-hidden rounded-3xl border border-border bg-surface px-7 py-10 transition hover:border-palm/30 hover:bg-surface-muted"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-chili">
            Sur place
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-palm sm:text-4xl">
            Retrait
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
            Passez chercher votre commande dès qu&apos;elle est prête.
          </p>
          <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-chili transition group-hover:gap-3">
            Commander
            <span aria-hidden>→</span>
          </span>
        </Link>
      </section>

      {/* —— CTA final —— */}
      <section className="relative overflow-hidden bg-palm-deep px-5 py-16 text-white sm:px-8 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-chili/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-saffron/15 blur-3xl"
        />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-5xl">
              Une question avant de commander&nbsp;?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
              Écrivez-nous sur WhatsApp — on répond rapidement pour le menu, les
              horaires ou une commande spéciale.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1ebe57]"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M20.52 3.48A11.88 11.88 0 0 0 12.04 0C5.47 0 .12 5.34.12 11.9c0 2.1.55 4.16 1.6 5.97L0 24l6.32-1.66a11.84 11.84 0 0 0 5.72 1.46h.01c6.57 0 11.92-5.35 11.92-11.9 0-3.18-1.24-6.16-3.45-8.42ZM12.05 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.75.98 1-3.65-.23-.37a9.9 9.9 0 0 1-1.52-5.27c0-5.47 4.45-9.91 9.92-9.91 2.65 0 5.15 1.03 7.02 2.9a9.84 9.84 0 0 1 2.9 7 9.92 9.92 0 0 1-9.94 9.91Zm5.44-7.4c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.16-.18.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.94-2.24-.25-.6-.5-.5-.68-.5h-.58c-.2 0-.53.07-.8.37-.28.3-1.06 1.03-1.06 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.23 5.14 4.54.72.31 1.28.5 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
              </svg>
              WhatsApp
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center rounded-xl bg-chili px-6 py-3.5 text-sm font-bold text-white transition hover:bg-chili-hover"
            >
              Ouvrir le menu
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
