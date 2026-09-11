"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SuiviPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const statusSteps = [
    { label: "En attente", icon: "clock" },
    { label: "En preparation", icon: "cook" },
    { label: "Pret", icon: "check" },
    { label: "Livre", icon: "delivery" },
  ] as const;

  function renderStatusIcon(icon: (typeof statusSteps)[number]["icon"]) {
    if (icon === "clock") {
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    }
    if (icon === "cook") {
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 10h10" />
          <path d="M3 13h11" />
          <path d="M3 16h10" />
          <path d="M16 6v11a2 2 0 0 0 2 2h1" />
          <path d="M20 6v13" />
        </svg>
      );
    }
    if (icon === "check") {
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="8" />
          <path d="m8.8 12.3 2.2 2.3 4.2-4.6" />
        </svg>
      );
    }
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3.5" y="7.5" width="12" height="8" rx="1.5" />
        <path d="M15.5 10h3l2 2v3.5h-5" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="17.5" cy="17.5" r="1.5" />
      </svg>
    );
  }

  return (
    <section className="kitchen-grain relative overflow-hidden rounded-3xl border border-border bg-surface p-5 sm:p-8">
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-chili/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-palm/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-chili">
            Suivi instantané
          </p>
          <h1 className="text-3xl font-extrabold leading-tight text-palm sm:text-4xl">
            Votre commande, en direct.
          </h1>
          <p className="max-w-xl text-sm text-ink-muted sm:text-base">
            Entrez votre code pour consulter l&apos;avancement : dépôt MoMo,
            payé, puis prêt.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="glass-panel">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Exemple de code
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-palm">ILO-123456-789</p>
            </Card>
            <Card className="glass-panel">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Conseil
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                Copiez le code reçu après validation de commande.
              </p>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="space-y-4 border-palm/15 p-5 shadow-[0_16px_48px_rgba(10,61,46,0.1)] sm:p-6">
            <h2 className="text-xl font-extrabold text-palm">Rechercher une commande</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/commande/${code.trim()}`);
              }}
              className="space-y-3"
            >
              <Input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Code de commande"
                className="h-11"
              />
              <Button className="h-11 w-full" type="submit">
                Suivre maintenant
              </Button>
            </form>

            <div className="space-y-2 border-t border-border pt-3">
              {statusSteps.map((step) => (
                <div key={step.label} className="flex items-center gap-2 text-sm text-ink-muted">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface-muted text-palm">
                    {renderStatusIcon(step.icon)}
                  </span>
                  {step.label}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
