"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    <section className="relative min-h-screen overflow-hidden bg-[#f5f5f7]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.08),transparent_32%),radial-gradient(circle_at_80%_5%,rgba(0,0,0,0.06),transparent_34%),linear-gradient(140deg,rgba(0,0,0,0.04),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]">
        <div className="grid h-full grid-cols-8 gap-2 p-6 opacity-35 sm:gap-3 sm:p-10">
          {Array.from({ length: 64 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/60 bg-gradient-to-br from-white/70 via-zinc-200/40 to-zinc-300/20 shadow-[0_8px_22px_rgba(0,0,0,0.04)] backdrop-blur-sm"
            />
          ))}
        </div>
      </div>

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
            className="rounded-3xl border border-white/70 bg-gradient-to-br from-black via-zinc-900 to-zinc-700 p-7 text-white shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 backdrop-blur">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
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
              <span className="text-xs font-semibold tracking-[0.2em]">
                Manger Sain (Chez DOSSOU-YOVO)
              </span>
            </div>

            <h1 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">
              Espace de pilotage
              <br />
              premium.
            </h1>
            <p className="mt-3 max-w-md text-sm text-white/75">
              Connectez-vous pour gerer le restaurant avec une experience moderne,
              elegante et orientee performance.
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
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
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
            <Card className="space-y-5 border-white/80 bg-white/85 p-6 shadow-[0_16px_52px_rgba(0,0,0,0.1)] backdrop-blur-md sm:p-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Connexion securisee
                </p>
                <h2 className="mt-1 text-2xl font-black text-zinc-900">Back Office</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Entrez vos identifiants pour acceder au tableau de bord.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Adresse email</label>
                  <Input
                    required
                    type="email"
                    placeholder="admin@ilosiwaju.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Mot de passe</label>
                  <Input
                    required
                    type="password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="h-11 w-full bg-black text-white hover:bg-zinc-800" type="submit" disabled={loading}>
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>

              <p className="text-center text-xs text-zinc-500">
                Espace reserve aux administrateurs autorises.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
