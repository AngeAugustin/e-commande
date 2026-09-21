import Link from "next/link";
import type { Metadata } from "next";

import { RESTAURANT_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Guide | Admin ${RESTAURANT_NAME}`,
};

const SECTIONS = [
  {
    id: "demarrer",
    title: "Démarrer",
    items: [
      {
        title: "Connexion",
        text: "Connectez-vous via /admin/login avec l’email et le mot de passe fournis. La session reste active plusieurs jours.",
      },
      {
        title: "Deux rôles",
        text: "Administrateur : catalogue, commandes et référentiel. Super administrateur : les mêmes droits, plus la gestion des utilisateurs et la suppression de commandes.",
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    href: "/admin",
    items: [
      {
        title: "Vue d’ensemble",
        text: "Chiffre d’affaires, nombre de commandes, produits et répartition des statuts. Utile pour démarrer la journée.",
      },
      {
        title: "Export CSV",
        text: "Le bouton d’export télécharge les statistiques pour un suivi hors ligne ou une analyse Excel.",
      },
    ],
  },
  {
    id: "produits",
    title: "Produits",
    href: "/admin/produits",
    items: [
      {
        title: "Ajouter un plat",
        text: "Créez un produit avec nom, description, prix et photo. Seuls les plats marqués disponibles apparaissent sur le menu public.",
      },
      {
        title: "Indisponible",
        text: "Désactivez un plat sans le supprimer quand il n’est plus au menu du jour. Vous pourrez le réactiver plus tard.",
      },
    ],
  },
  {
    id: "commandes",
    title: "Commandes",
    href: "/admin/commandes",
    items: [
      {
        title: "Suivre le flux",
        text: "Chaque commande en ligne arrive en « Attente dépôt MoMo ». Dès le paiement reçu, passez-la en « Payé », puis en « Prêt » quand c’est servi.",
      },
      {
        title: "Créer une commande",
        text: "Via « Nouvelle commande », enregistrez une commande passée au comptoir ou par téléphone — utile pour tout centraliser.",
      },
      {
        title: "Détail & reçu",
        text: "Ouvrez une commande pour voir les plats, le client et le mode (retrait / livraison). Imprimez ou partagez le reçu si besoin.",
      },
    ],
  },
  {
    id: "referentiel",
    title: "Référentiel",
    href: "/admin/referentiel",
    items: [
      {
        title: "Numéros MoMo",
        text: "Renseignez les numéros MTN et Moov affichés aux clients pour le dépôt. Sans ces numéros, le paiement en ligne est incomplet.",
      },
      {
        title: "WhatsApp",
        text: "Le numéro WhatsApp alimente le bouton contact du site public. Mettez à jour si le numéro du restaurant change.",
      },
    ],
  },
  {
    id: "utilisateurs",
    title: "Utilisateurs",
    href: "/admin/utilisateurs",
    note: "Réservé au super administrateur",
    items: [
      {
        title: "Créer un compte",
        text: "Ajoutez un membre de l’équipe (admin ou super admin) pour qu’il puisse se connecter à l’espace.",
      },
      {
        title: "Sécurité",
        text: "Limitez le rôle super admin aux personnes de confiance. Un admin suffit pour le quotidien cuisine / caisse.",
      },
    ],
  },
] as const;

const QUICK_TIPS = [
  "Traitez d’abord les commandes en attente de dépôt, puis celles payées à préparer.",
  "Gardez le référentiel MoMo à jour : c’est ce que voient les clients sur leur ticket.",
  "Un plat indisponible reste dans la base : pas besoin de le recréer demain.",
] as const;

export default function AdminGuidePage() {
  return (
    <section className="mx-auto max-w-3xl space-y-8 pb-8">
      <div>
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-chili">
          Documentation
        </p>
        <h1 className="mt-2 text-3xl font-bold text-palm">Guide d’utilisation</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
          Tout ce qu’il faut pour gérer le menu, les commandes et les numéros
          de contact — sans jargon.
        </p>
      </div>

      <nav
        aria-label="Sommaire du guide"
        className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface p-3"
      >
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-full bg-surface-muted px-3.5 py-1.5 text-xs font-semibold text-palm transition hover:bg-palm hover:text-white"
          >
            {section.title}
          </a>
        ))}
      </nav>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <article
            key={section.id}
            id={section.id}
            className="scroll-mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-palm">
                {section.title}
              </h2>
              {"href" in section && section.href ? (
                <Link
                  href={section.href}
                  className="text-xs font-semibold text-chili transition hover:underline"
                >
                  Ouvrir →
                </Link>
              ) : null}
            </div>
            {"note" in section && section.note ? (
              <p className="mt-2 inline-flex rounded-full bg-saffron/15 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-palm">
                {section.note}
              </p>
            ) : null}
            <ul className="mt-4 space-y-4">
              {section.items.map((item) => (
                <li key={item.title}>
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <aside className="rounded-2xl border border-palm/15 bg-palm-deep px-5 py-6 text-white sm:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Astuces du quotidien
        </h2>
        <ul className="mt-4 space-y-3">
          {QUICK_TIPS.map((tip) => (
            <li
              key={tip}
              className="flex gap-3 text-sm leading-relaxed text-white/80"
            >
              <span
                aria-hidden
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron"
              />
              {tip}
            </li>
          ))}
        </ul>
      </aside>

      <p className="text-center text-sm text-ink-muted">
        Besoin d’aide côté client&nbsp;?{" "}
        <Link
          href="/comment-ca-marche"
          className="font-semibold text-chili hover:underline"
          target="_blank"
        >
          Voir le guide public
        </Link>
      </p>
    </section>
  );
}
