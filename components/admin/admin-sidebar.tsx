"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { RESTAURANT_NAME, RESTAURANT_TAGLINE } from "@/lib/constants";
import { ROLE_LABELS, canManageUsers, isStaffRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

const allLinks = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/produits", label: "Produits", icon: "products" },
  { href: "/admin/commandes", label: "Commandes", icon: "orders" },
  { href: "/admin/referentiel", label: "Referentiel", icon: "referentiel" },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "users", superOnly: true },
] as const;

function NavIcon({ type }: { type: (typeof allLinks)[number]["icon"] }) {
  if (type === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.2" />
        <rect x="14" y="3" width="7" height="4" rx="1.2" />
        <rect x="14" y="10" width="7" height="11" rx="1.2" />
        <rect x="3" y="13" width="7" height="8" rx="1.2" />
      </svg>
    );
  }
  if (type === "products") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16" />
        <path d="M6 7v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      </svg>
    );
  }
  if (type === "orders") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="3" width="14" height="18" rx="2" />
        <path d="M8 8h6" />
        <path d="M8 12h6" />
        <path d="M8 16h4" />
      </svg>
    );
  }
  if (type === "users") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 18a5.5 5.5 0 0 1 11 0" />
        <circle cx="17.5" cy="9.5" r="2.5" />
        <path d="M14.5 18a4.5 4.5 0 0 1 6 0" />
      </svg>
    );
  }
  if (type === "referentiel") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z" />
        <path d="M8 4a2 2 0 0 0-2 2v14" />
        <path d="M11 9h5" />
        <path d="M11 13h5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 18V9" />
      <path d="M10 18V5" />
      <path d="M16 18v-7" />
      <path d="M22 18v-3" />
    </svg>
  );
}

type AdminSidebarProps = {
  adminEmail: string;
  adminRole: string;
  adminFirstName: string;
  adminLastName: string;
};

export function AdminSidebar({
  adminEmail,
  adminRole,
  adminFirstName,
  adminLastName,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const initials = adminEmail.slice(0, 2).toUpperCase();
  const links = allLinks.filter(
    (link) => !("superOnly" in link && link.superOnly) || canManageUsers(adminRole),
  );
  const isLinkActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-40 shrink-0 border-b border-border/70 bg-surface/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-palm text-white">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 6.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M4 15a8 8 0 0 1 16 0" />
                <path d="M3 15h18" />
                <path d="M5 19h14" />
              </svg>
            </span>
            <div>
              <p className="font-[family-name:var(--font-display)] text-base font-bold tracking-tight text-palm">
                {RESTAURANT_NAME}
              </p>
              <p className="text-xs text-ink-muted">{RESTAURANT_TAGLINE}</p>
            </div>
          </div>
          <button
            onClick={() => setOpenModal(true)}
            aria-label="Ouvrir le profil admin"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-chili text-sm font-bold text-white"
          >
            {initials}
          </button>
        </div>
      </header>

      <aside className="hidden h-dvh w-72 shrink-0 flex-col border-r border-border/70 bg-surface p-6 lg:flex">
        <div>
          <div className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-palm to-palm-deep p-4 text-white shadow-[0_12px_32px_rgba(10,61,46,0.2)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 6.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M4 15a8 8 0 0 1 16 0" />
                  <path d="M3 15h18" />
                  <path d="M5 19h14" />
                </svg>
              </span>
              <div>
                <p className="font-[family-name:var(--font-display)] text-base font-bold tracking-tight">
                  {RESTAURANT_NAME}
                </p>
                <p className="text-xs text-white/70">{RESTAURANT_TAGLINE}</p>
              </div>
            </div>
          </div>

          <nav className="grid gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isLinkActive(link.href)
                    ? "bg-palm text-white shadow-[0_6px_16px_rgba(10,61,46,0.25)]"
                    : "bg-surface-muted text-ink-muted hover:bg-palm/10 hover:text-palm",
                )}
              >
                <NavIcon type={link.icon} />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          className="mt-auto inline-flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left transition hover:border-palm/25 hover:bg-surface-muted"
          onClick={() => setOpenModal(true)}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-chili text-sm font-bold text-white">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">{adminEmail}</span>
            <span className="block text-xs text-ink-muted">
              {isStaffRole(adminRole) ? ROLE_LABELS[adminRole] : adminRole}
            </span>
          </span>
        </button>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-surface/95 backdrop-blur lg:hidden">
        <div
          className={cn(
            "grid gap-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2",
            links.length >= 5 ? "grid-cols-5" : links.length === 4 ? "grid-cols-4" : "grid-cols-3",
          )}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition",
                isLinkActive(link.href) ? "text-chili" : "text-ink-muted hover:text-palm",
              )}
            >
              <NavIcon type={link.icon} />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {openModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-palm-deep/45 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-xl">
            <h3 className="text-lg font-bold text-palm">Profil administrateur</h3>
            <div className="mt-3 space-y-2 rounded-xl border border-border bg-surface-muted p-3">
              <p className="text-sm">
                <span className="font-semibold text-foreground">Nom :</span>{" "}
                <span className="text-ink-muted">{adminLastName || "-"}</span>
              </p>
              <p className="text-sm">
                <span className="font-semibold text-foreground">Prenom :</span>{" "}
                <span className="text-ink-muted">{adminFirstName || "-"}</span>
              </p>
              <p className="text-sm">
                <span className="font-semibold text-foreground">Email :</span>{" "}
                <span className="text-ink-muted">{adminEmail}</span>
              </p>
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              Voulez-vous vraiment vous deconnecter de votre session admin ?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpenModal(false)}>
                Annuler
              </Button>
              <Button onClick={logout}>Se deconnecter</Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
