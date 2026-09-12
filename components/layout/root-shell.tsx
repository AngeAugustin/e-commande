"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function RootShell({
  children,
  whatsappHref,
}: {
  children: ReactNode;
  whatsappHref: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader whatsappHref={whatsappHref} />
      <main
        className={
          isHome
            ? "w-full flex-1 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-0 -mt-[57px]"
            : "mx-auto w-full max-w-6xl flex-1 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-5 md:pb-8 md:pt-8"
        }
      >
        {children}
      </main>
      <div className="hidden md:block">
        <SiteFooter />
      </div>
    </>
  );
}
