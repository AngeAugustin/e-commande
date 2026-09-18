import Image from "next/image";
import Link from "next/link";

import { getWhatsAppNumberFromReferentiel, buildWhatsAppHref } from "@/lib/contact";
import {
  RESTAURANT_LOCATION,
  RESTAURANT_NAME,
  RESTAURANT_TAGLINE,
} from "@/lib/constants";
import { connectToDatabase } from "@/lib/mongodb";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/models/Product";

function IconFlame({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3c1.5 3 1 5.5-.5 7.5C10 12 9 13.2 9 15a3 3 0 0 0 6 0c0-2.2-1.2-3.8-2.5-5.2C11.2 8.4 11 6.5 12 3Z" />
      <path d="M12 18v.5" />
    </svg>
  );
}

function IconUtensils({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function IconBowl({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 12a9 9 0 0 0 18 0" />
      <path d="M12 5v2" />
      <path d="M8 7c1.2 1 2.5 1.5 4 1.5S14.8 8 16 7" />
    </svg>
  );
}

function IconChefHat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 14c-1.7 0-3-1.3-3-3 0-1.4 1-2.6 2.3-2.9A4 4 0 0 1 12 5a4 4 0 0 1 6.7 3.1C20 8.4 21 9.6 21 11c0 1.7-1.3 3-3 3" />
      <path d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

function IconLeaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M11 20A17 17 0 0 1 4 7c5-1 10 1 13 5a17 17 0 0 1-6 8Z" />
      <path d="M2 21c5-3 8-6 9-9" />
    </svg>
  );
}

function IconCup({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 7h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V7Z" />
      <path d="M16 9h2.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 21h5" />
    </svg>
  );
}

function IconPlate({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function IconPepper({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 4c.8 0 1.5.5 1.8 1.2L15 8c2.5 1.2 4 3.5 4 6.2A5.8 5.8 0 0 1 13.2 20H10A5 5 0 0 1 5 15.2C5 11.8 7 9 10 8l1.2-2.8C11.5 4.5 12.2 4 13 4h-1Z" />
      <path d="M12 4c0-1 .6-2 2-2" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconBag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 4h12l-1 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 4Z" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M5 8h14" />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m12 3 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18l.9-5.4L4.2 8.7l5.4-.8L12 3Z" />
    </svg>
  );
}

function IconFish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6.5 12c2-4 6-6.5 11-6.5 0 0 1.5 3 1.5 6.5S17.5 18.5 17.5 18.5c-5 0-9-2.5-11-6.5Z" />
      <path d="M6.5 12 3 9v6l3.5-3Z" />
      <circle cx="15.5" cy="10.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

const MOSAIC_ICONS = [
  { id: "flame", Icon: IconFlame, tone: "text-chili/50" },
  { id: "utensils", Icon: IconUtensils, tone: "text-white/35" },
  { id: "bowl", Icon: IconBowl, tone: "text-saffron/40" },
  { id: "chef", Icon: IconChefHat, tone: "text-white/32" },
  { id: "leaf", Icon: IconLeaf, tone: "text-saffron/45" },
  { id: "cup", Icon: IconCup, tone: "text-chili/40" },
  { id: "plate", Icon: IconPlate, tone: "text-white/35" },
  { id: "pepper", Icon: IconPepper, tone: "text-chili/45" },
  { id: "clock", Icon: IconClock, tone: "text-white/30" },
  { id: "bag", Icon: IconBag, tone: "text-saffron/35" },
  { id: "star", Icon: IconStar, tone: "text-white/28" },
  { id: "fish", Icon: IconFish, tone: "text-chili/35" },
] as const;

const STEPS = [
  {
    label: "Menu",
    title: "Choisissez",
    text: "Parcourez les plats du jour et composez votre panier.",
  },
  {
    label: "Cuisine",
    title: "On prépare",
    text: "Validez, payez par MoMo — la cuisine s’occupe du reste.",
  },
  {
    label: "Comptoir",
    title: "Retirez",
    text: "Suivez l’avancement et passez chercher au restaurant.",
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
  const [whatsappNumber, featured] = await Promise.all([
    getWhatsAppNumberFromReferentiel(),
    getFeaturedDishes(),
  ]);
  const whatsappHref = whatsappNumber
    ? buildWhatsAppHref(
        whatsappNumber,
        `Bonjour, je souhaite passer une commande chez ${RESTAURANT_NAME}.`,
      )
    : null;
  const marqueeItems =
    featured.length > 0 ? [...featured, ...featured] : [];

  return (
    <div className="bg-background">
      {/* —— Hero mosaïque d’icônes —— */}
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-palm-deep text-white">
        <div aria-hidden className="absolute inset-0">
          <div className="hero-mosaic absolute inset-0">
            {MOSAIC_ICONS.map(({ id, Icon, tone }, index) => (
              <div
                key={id}
                className="hero-mosaic-cell flex items-center justify-center"
              >
                <Icon
                  className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 ${tone} ${
                    index % 3 === 0
                      ? "-rotate-6"
                      : index % 3 === 1
                        ? "rotate-6"
                        : ""
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,40,32,0.45)_0%,rgba(6,40,32,0.88)_62%,rgba(6,40,32,0.96)_100%)]" />
          <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.22]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-3xl flex-col items-center justify-center px-5 pb-20 pt-28 text-center sm:px-8">
          <p className="animate-fade-up text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-saffron/90 sm:text-xs">
            Cuisine locale · Retrait sur place
          </p>

          <p className="animate-fade-up mt-6 font-[family-name:var(--font-display)] text-[clamp(2.1rem,7.5vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.03em]">
            Chez Dossou
            <br />
            <span className="relative inline-block whitespace-nowrap">
              - Yovo
            </span>
          </p>

          <p className="animate-fade-up mt-4 text-sm font-semibold tracking-[0.04em] text-saffron sm:text-base">
            {RESTAURANT_TAGLINE}
          </p>

          <h1 className="animate-fade-up-delay mt-8 max-w-lg text-lg font-medium leading-snug text-white/90 sm:mt-10 sm:text-xl md:text-2xl">
            Le goût du feu, commandé en un geste.
          </h1>

          <p className="animate-fade-up-delay mt-3 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
            Menu du jour, paiement MoMo, suivi en direct — prêt pour votre
            table.
          </p>

          <div className="animate-fade-up-delay-2 mt-10 flex w-full max-w-xl justify-center">
            <Link
              href="/menu"
              className="group inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-chili px-10 py-4 text-base font-bold text-white shadow-[0_16px_40px_rgba(224,69,26,0.4)] transition hover:bg-chili-hover hover:shadow-[0_18px_48px_rgba(224,69,26,0.5)] sm:w-auto sm:min-w-[20rem]"
            >
              Commander maintenant
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* —— Passe-plat (signature) —— */}
      <section className="relative overflow-hidden border-b border-border/50 bg-surface py-16 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-5 sm:px-8">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-chili">
              Au menu
            </p>
            <h2 className="mt-3 max-w-lg font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-palm sm:text-5xl">
              Ce qui sort de la cuisine.
            </h2>
          </div>
          <Link
            href="/menu"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-palm transition hover:text-chili"
          >
            Voir la carte complète
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="passe-plat mt-12 overflow-hidden">
            <div className="passe-plat-track flex w-max gap-5 pe-5 sm:gap-6 sm:pe-6">
              {marqueeItems.map((dish, index) => (
                <Link
                  key={`${dish.id}-${index}`}
                  href="/menu"
                  className="group relative w-[72vw] max-w-[22rem] shrink-0 sm:w-80"
                  tabIndex={index >= featured.length ? -1 : undefined}
                  aria-hidden={index >= featured.length ? true : undefined}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={dish.image}
                      alt={index >= featured.length ? "" : dish.name}
                      fill
                      sizes="(max-width: 640px) 72vw, 320px"
                      className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-palm-deep/95 via-palm-deep/25 to-transparent opacity-90 transition group-hover:opacity-100" />
                    <span className="absolute top-4 right-4 font-[family-name:var(--font-display)] text-sm font-bold text-white/95">
                      {formatPrice(dish.price)}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <p className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-white">
                        {dish.name}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/70">
                        {dish.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="mx-auto mt-12 max-w-6xl px-5 text-sm text-ink-muted sm:px-8">
            Aucun plat disponible pour le moment.{" "}
            <Link
              href="/menu"
              className="font-semibold text-chili hover:underline"
            >
              Voir le menu
            </Link>
          </p>
        )}
      </section>

      {/* —— Chez nous —— */}
      <section className="bg-palm-deep px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-saffron/90">
            Chez nous
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Une table de quartier, une cuisine qui parle.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
            Grillades, sauces, classiques du jour — on cuisine pour le
            voisinage, et maintenant pour votre commande en ligne. Passez
            chercher au comptoir dès que c’est prêt.
          </p>
          <Link
            href="/menu"
            className="mt-8 inline-flex items-center gap-2 border-b border-chili pb-1 text-sm font-bold text-white transition hover:border-white hover:text-saffron"
          >
            Découvrir le menu
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* —— Parcours —— */}
      <section className="kitchen-grain mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-chili">
          Comment commander
        </p>
        <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl font-bold text-palm sm:text-4xl">
          Trois gestes, puis à table.
        </h2>

        <ol className="mt-12 grid gap-0 border-t border-border sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="border-b border-border py-8 sm:border-b-0 sm:border-r sm:px-6 sm:py-10 sm:first:ps-0 sm:last:border-r-0 sm:last:pe-0"
            >
              <p className="font-[family-name:var(--font-display)] text-4xl font-bold text-palm/15 sm:text-5xl">
                0{index + 1}
              </p>
              <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-chili">
                {step.label}
              </p>
              <h3 className="mt-2 text-xl font-bold text-palm">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* —— CTA final —— */}
      <section className="relative overflow-hidden bg-palm px-5 py-20 text-white sm:px-8 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-chili/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-saffron/20 blur-3xl"
        />
        <div
          aria-hidden
          className="film-grain pointer-events-none absolute inset-0 opacity-20"
        />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-saffron/90">
              Prêt à commander
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.05] sm:text-5xl">
              La cuisine vous attend.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
              Retrait sur place à {RESTAURANT_LOCATION}. Une question sur le menu
              ou les horaires&nbsp;? Écrivez-nous sur WhatsApp
              {whatsappNumber ? (
                <>
                  {" "}
                  (
                  <span className="font-semibold text-white/90">
                    {whatsappNumber}
                  </span>
                  )
                </>
              ) : null}{" "}
              — on répond vite.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center rounded-full bg-chili px-8 py-4 text-sm font-bold text-white transition hover:bg-chili-hover"
            >
              Ouvrir le menu
            </Link>
            {whatsappHref ? (
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-[#25D366]"
                  fill="currentColor"
                >
                  <path d="M20.52 3.48A11.88 11.88 0 0 0 12.04 0C5.47 0 .12 5.34.12 11.9c0 2.1.55 4.16 1.6 5.97L0 24l6.32-1.66a11.84 11.84 0 0 0 5.72 1.46h.01c6.57 0 11.92-5.35 11.92-11.9 0-3.18-1.24-6.16-3.45-8.42ZM12.05 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.75.98 1-3.65-.23-.37a9.9 9.9 0 0 1-1.52-5.27c0-5.47 4.45-9.91 9.92-9.91 2.65 0 5.15 1.03 7.02 2.9a9.84 9.84 0 0 1 2.9 7 9.92 9.92 0 0 1-9.94 9.91Zm5.44-7.4c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.16-.18.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.94-2.24-.25-.6-.5-.5-.68-.5h-.58c-.2 0-.53.07-.8.37-.28.3-1.06 1.03-1.06 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.23 5.14 4.54.72.31 1.28.5 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
                </svg>
                WhatsApp
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
