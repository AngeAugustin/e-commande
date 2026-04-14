"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CartIndicator } from "@/components/layout/cart-indicator";
import { useCartStore } from "@/store/cart-store";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/menu", label: "Menu" },
  { href: "/suivi", label: "Suivi" },
];

const whatsappHref = "https://wa.me/22954053660";

export function SiteHeader() {
  const pathname = usePathname();
  const count = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0),
  );

  const mobileLinks = [
    { href: "/", label: "Accueil" },
    { href: "/menu", label: "Menu" },
    { href: "/suivi", label: "Suivi" },
    { href: "/panier", label: "Panier" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-black tracking-tight">
            <span className="inline-flex items-center gap-2">
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
              ILOSIWAJU
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              aria-label="Contacter le restaurant sur WhatsApp"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4.5 w-4.5"
                fill="currentColor"
              >
                <path d="M20.52 3.48A11.88 11.88 0 0 0 12.04 0C5.47 0 .12 5.34.12 11.9c0 2.1.55 4.16 1.6 5.97L0 24l6.32-1.66a11.84 11.84 0 0 0 5.72 1.46h.01c6.57 0 11.92-5.35 11.92-11.9 0-3.18-1.24-6.16-3.45-8.42ZM12.05 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.75.98 1-3.65-.23-.37a9.9 9.9 0 0 1-1.52-5.27c0-5.47 4.45-9.91 9.92-9.91 2.65 0 5.15 1.03 7.02 2.9a9.84 9.84 0 0 1 2.9 7 9.92 9.92 0 0 1-9.94 9.91Zm5.44-7.4c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.16-.18.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.94-2.24-.25-.6-.5-.5-.68-.5h-.58c-.2 0-.53.07-.8.37-.28.3-1.06 1.03-1.06 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.23 5.14 4.54.72.31 1.28.5 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
              </svg>
            </Link>
            <CartIndicator />
          </nav>

          <Link
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            aria-label="Contacter le restaurant sur WhatsApp"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 md:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4.5 w-4.5"
              fill="currentColor"
            >
              <path d="M20.52 3.48A11.88 11.88 0 0 0 12.04 0C5.47 0 .12 5.34.12 11.9c0 2.1.55 4.16 1.6 5.97L0 24l6.32-1.66a11.84 11.84 0 0 0 5.72 1.46h.01c6.57 0 11.92-5.35 11.92-11.9 0-3.18-1.24-6.16-3.45-8.42ZM12.05 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.75.98 1-3.65-.23-.37a9.9 9.9 0 0 1-1.52-5.27c0-5.47 4.45-9.91 9.92-9.91 2.65 0 5.15 1.03 7.02 2.9a9.84 9.84 0 0 1 2.9 7 9.92 9.92 0 0 1-9.94 9.91Zm5.44-7.4c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.16-.18.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.94-2.24-.25-.6-.5-.5-.68-.5h-.58c-.2 0-.53.07-.8.37-.28.3-1.06 1.03-1.06 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.23 5.14 4.54.72.31 1.28.5 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
            </svg>
          </Link>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white md:hidden">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-4 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {mobileLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium transition ${
                  isActive ? "text-black" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {link.href === "/" ? (
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
                    <path d="m3 10.5 9-7 9 7" />
                    <path d="M5.5 9.5V20h13V9.5" />
                    <path d="M9.5 20v-6h5v6" />
                  </svg>
                ) : null}

                {link.href === "/menu" ? (
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
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </svg>
                ) : null}

                {link.href === "/suivi" ? (
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
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                ) : null}

                {link.href === "/panier" ? (
                  <>
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
                      <circle cx="9" cy="20" r="1.5" />
                      <circle cx="18" cy="20" r="1.5" />
                      <path d="M3 4h2l2.4 10.5h10.8L21 7H6.8" />
                    </svg>
                    {count > 0 ? (
                      <span className="absolute right-5 top-1 rounded-full bg-black px-1.5 text-[10px] text-white">
                        {count}
                      </span>
                    ) : null}
                  </>
                ) : null}

                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
