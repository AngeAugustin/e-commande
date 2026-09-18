import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";
import { RootShell } from "@/components/layout/root-shell";
import { ToastProvider } from "@/components/providers/toast-provider";
import {
  buildWhatsAppHref,
  getWhatsAppNumberFromReferentiel,
} from "@/lib/contact";
import { RESTAURANT_NAME, RESTAURANT_TAGLINE } from "@/lib/constants";

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: `${RESTAURANT_NAME} | ${RESTAURANT_TAGLINE}`,
  description: `Commandez vos plats chez ${RESTAURANT_NAME} — ${RESTAURANT_TAGLINE}, cuisine locale, retrait sur place.`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Required for per-request CSP nonces (Next applies nonce from CSP header).
  await connection();
  const whatsappNumber = await getWhatsAppNumberFromReferentiel();
  const whatsappHref = whatsappNumber ? buildWhatsAppHref(whatsappNumber) : null;

  return (
    <html
      lang="fr"
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <RootShell whatsappHref={whatsappHref}>{children}</RootShell>
        <ToastProvider />
      </body>
    </html>
  );
}
