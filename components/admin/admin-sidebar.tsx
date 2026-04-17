"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/produits", label: "Produits", icon: "products" },
  { href: "/admin/commandes", label: "Commandes", icon: "orders" },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "users" },
] as const;

function NavIcon({ type }: { type: (typeof links)[number]["icon"] }) {
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
  const isLinkActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
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
              <p className="text-base font-black tracking-tight">Manger Sain (Chez DOSSOU-YOVO)</p>
              <p className="text-xs text-zinc-500">Back Office Admin</p>
            </div>
          </div>
          <button
            onClick={() => setOpenModal(true)}
            aria-label="Ouvrir le profil admin"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white"
          >
            {initials}
          </button>
        </div>
      </header>

      <aside className="hidden min-h-screen w-72 flex-col border-r border-zinc-200 bg-white p-6 lg:flex">
        <div>
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
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
                <p className="text-base font-black tracking-tight">Manger Sain (Chez DOSSOU-YOVO)</p>
                <p className="text-xs text-zinc-500">Back Office</p>
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
                    ? "bg-black text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                )}
              >
                <NavIcon type={link.icon} />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          className="mt-auto inline-flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 text-left transition hover:bg-zinc-50"
          onClick={() => setOpenModal(true)}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{adminEmail}</span>
            <span className="block text-xs text-zinc-500">{adminRole}</span>
          </span>
        </button>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white lg:hidden">
        <div className="grid grid-cols-4 gap-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-medium transition",
                isLinkActive(link.href) ? "text-black" : "text-zinc-500 hover:text-zinc-800",
              )}
            >
              <NavIcon type={link.icon} />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {openModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-black">Profil administrateur</h3>
            <div className="mt-3 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-sm">
                <span className="font-semibold text-zinc-700">Nom :</span>{" "}
                <span className="text-zinc-600">{adminLastName || "-"}</span>
              </p>
              <p className="text-sm">
                <span className="font-semibold text-zinc-700">Prenom :</span>{" "}
                <span className="text-zinc-600">{adminFirstName || "-"}</span>
              </p>
              <p className="text-sm">
                <span className="font-semibold text-zinc-700">Email :</span>{" "}
                <span className="text-zinc-600">{adminEmail}</span>
              </p>
            </div>
            <p className="mt-2 text-sm text-zinc-600">
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
