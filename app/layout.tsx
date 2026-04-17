import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { RootShell } from "@/components/layout/root-shell";
import { ToastProvider } from "@/components/providers/toast-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Manger Sain (Chez DOSSOU-YOVO) | Commande en ligne",
  description:
    "Application premium de commande et gestion du restaurant Manger Sain (Chez DOSSOU-YOVO)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fafafa] text-black">
        <RootShell>{children}</RootShell>
        <ToastProvider />
      </body>
    </html>
  );
}
