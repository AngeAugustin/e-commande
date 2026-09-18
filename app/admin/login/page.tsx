"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RESTAURANT_NAME, RESTAURANT_TAGLINE } from "@/lib/constants";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);

    if (!res.ok) {
      toast.error("Identifiants invalides");
      return;
    }

    toast.success("Connexion reussie");
    router.push("/admin");
    router.refresh();
  }

  return (
    <section className="kitchen-grain relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-chili/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-palm/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_440px]"
        >
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.45 }}
            className="rounded-3xl border border-palm/20 bg-gradient-to-br from-palm-deep via-palm to-palm-soft p-7 text-white shadow-[0_24px_60px_rgba(10,61,46,0.35)]"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 backdrop-blur">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-chili text-white">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4.5 w-4.5"
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
              <span className="text-xs font-semibold tracking-[0.12em]">
                {RESTAURANT_NAME}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-white/65">{RESTAURANT_TAGLINE}</p>

            <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl">
              Espace de pilotage
              <br />
              du restaurant.
            </h1>
            <p className="mt-3 max-w-md text-sm text-white/75">
              Gérez commandes, produits et équipe avec la même identité visuelle
              que le portail client.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { label: "Commandes", icon: "orders" },
                { label: "Produits", icon: "products" },
                { label: "Equipe", icon: "users" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur"
                >
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-chili/90">
                    {item.icon === "orders" ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="4" y="3" width="14" height="18" rx="2" />
                        <path d="M8 8h6" />
                        <path d="M8 12h6" />
                        <path d="M8 16h4" />
                      </svg>
                    ) : null}
                    {item.icon === "products" ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M4 7h16" />
                        <path d="M6 7v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
                        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                      </svg>
                    ) : null}
                    {item.icon === "users" ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="9" cy="8" r="3" />
                        <path d="M3.5 18a5.5 5.5 0 0 1 11 0" />
                        <circle cx="17.5" cy="9.5" r="2.5" />
                        <path d="M14.5 18a4.5 4.5 0 0 1 6 0" />
                      </svg>
                    ) : null}
                  </div>
                  <p className="text-xs font-medium text-white/90">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.14, duration: 0.45 }}
          >
            <Card className="space-y-5 border-border bg-surface/95 p-6 shadow-[0_16px_52px_rgba(10,61,46,0.12)] backdrop-blur-md sm:p-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-chili">
                  Connexion securisee
                </p>
                <h2 className="mt-1 text-2xl font-bold text-palm">Back Office</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Entrez vos identifiants pour acceder au tableau de bord.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Adresse email</label>
                  <Input
                    required
                    type="email"
                    placeholder="admin@dossou-yovo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Mot de passe</label>
                  <Input
                    required
                    type="password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="h-11 w-full" type="submit" disabled={loading}>
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>

              <p className="text-center text-xs text-ink-muted">
                Espace reserve aux administrateurs autorises.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
