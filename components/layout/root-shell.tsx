"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function RootShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 md:pb-6 md:pt-6">
        {children}
      </main>
      <div className="hidden md:block">
        <SiteFooter />
      </div>
    </>
  );
}
