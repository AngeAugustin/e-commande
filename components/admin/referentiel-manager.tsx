"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMomoNetworkLogo } from "@/lib/momo-networks";
import type { ContactNumberDto, ContactNumberKind, MomoNetwork } from "@/types";

const PAGE_HINT =
  "Gerez les numeros Mobile Money (MTN / Moov) et WhatsApp affiches aux clients.";

type FormState = {
  kind: ContactNumberKind;
  number: string;
  network: MomoNetwork;
};

const initialForm: FormState = {
  kind: "momo",
  number: "",
  network: "MTN",
};

export function ReferentielManager({
  initialNumbers,
}: {
  initialNumbers: ContactNumberDto[];
}) {
  const [numbers, setNumbers] = useState<ContactNumberDto[]>(initialNumbers);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactNumberDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const momoNumbers = useMemo(
    () => numbers.filter((item) => item.kind === "momo"),
    [numbers],
  );
  const whatsappNumbers = useMemo(
    () => numbers.filter((item) => item.kind === "whatsapp"),
    [numbers],
  );

  const stats = [
    { label: "Total", value: String(numbers.length) },
    { label: "MoMo", value: String(momoNumbers.length) },
    { label: "WhatsApp", value: String(whatsappNumbers.length) },
    {
      label: "Reseaux MoMo",
      value: String(new Set(momoNumbers.map((n) => n.network).filter(Boolean)).size),
    },
  ];

  async function loadNumbers() {
    const res = await fetch("/api/contact-numbers");
    if (!res.ok) {
      toast.error("Chargement impossible");
      return;
    }
    const data = (await res.json()) as ContactNumberDto[];
    setNumbers(
      data.map((item) => ({
        ...item,
        _id: String(item._id),
      })),
    );
  }

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/contact-numbers/${editingId}` : "/api/contact-numbers";
    const payload =
      form.kind === "momo"
        ? { kind: form.kind, number: form.number, network: form.network }
        : { kind: form.kind, number: form.number };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast.error(data.message || "Operation impossible");
      return;
    }

    toast.success(editingId ? "Numero modifie" : "Numero ajoute");
    setForm(initialForm);
    setEditingId(null);
    setOpenModal(false);
    loadNumbers();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/contact-numbers/${deleteTarget._id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    setDeleting(false);

    if (!res.ok) {
      toast.error(data.message || "Suppression impossible");
      return;
    }

    toast.success("Numero supprime");
    setDeleteTarget(null);
    loadNumbers();
  }

  function openCreate(kind: ContactNumberKind) {
    setEditingId(null);
    setForm({ ...initialForm, kind });
    setOpenModal(true);
  }

  function openEdit(item: ContactNumberDto) {
    setEditingId(item._id);
    setForm({
      kind: item.kind,
      number: item.number,
      network: item.network ?? "MTN",
    });
    setOpenModal(true);
  }

  function NumberTable({
    title,
    items,
    showNetwork,
  }: {
    title: string;
    items: ContactNumberDto[];
    showNetwork: boolean;
  }) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
          <h2 className="text-base font-bold text-palm">{title}</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={() => openCreate(showNetwork ? "momo" : "whatsapp")}
          >
            Ajouter
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-muted text-left text-ink-muted">
              <tr>
                {showNetwork ? <th className="px-4 py-3 font-semibold">Reseau</th> : null}
                <th className="px-4 py-3 font-semibold">Numero</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={showNetwork ? 3 : 2}
                    className="px-4 py-6 text-ink-muted"
                  >
                    Aucun numero pour le moment.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="border-t border-border/60">
                    {showNetwork ? (
                      <td className="px-4 py-3">
                        {item.network ? (
                          <span className="inline-flex items-center gap-2">
                            <Image
                              src={getMomoNetworkLogo(item.network)}
                              alt={item.network}
                              width={28}
                              height={28}
                              className="h-7 w-7 rounded-md object-contain"
                            />
                            <span className="text-xs font-semibold text-foreground">
                              {item.network}
                            </span>
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    ) : null}
                    <td className="px-4 py-3 font-medium tracking-wide">{item.number}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-foreground transition hover:text-palm"
                          onClick={() => openEdit(item)}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          className="text-chili transition hover:opacity-80"
                          onClick={() => setDeleteTarget(item)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-palm">Referentiel</h1>
        <p className="text-sm text-ink-muted">{PAGE_HINT}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-ink-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-palm">{stat.value}</p>
          </Card>
        ))}
      </div>

      <NumberTable title="Numeros MoMo" items={momoNumbers} showNetwork />
      <NumberTable title="Numeros WhatsApp" items={whatsappNumbers} showNetwork={false} />

      {openModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-palm-deep/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
            <h3 className="text-lg font-bold text-palm">
              {editingId ? "Modifier le numero" : "Ajouter un numero"}
            </h3>
            <form className="mt-4 space-y-3" onSubmit={submitForm}>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-foreground">Type</span>
                <select
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-palm"
                  value={form.kind}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      kind: e.target.value as ContactNumberKind,
                    }))
                  }
                >
                  <option value="momo">MoMo</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </label>

              {form.kind === "momo" ? (
                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium text-foreground">Reseau</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(["MTN", "Moov"] as MomoNetwork[]).map((network) => {
                      const selected = form.network === network;
                      return (
                        <button
                          key={network}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, network }))}
                          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
                            selected
                              ? "border-palm bg-palm/8 ring-1 ring-palm/30"
                              : "border-border bg-surface hover:border-palm/30"
                          }`}
                        >
                          <Image
                            src={getMomoNetworkLogo(network)}
                            alt={network}
                            width={28}
                            height={28}
                            className="h-7 w-7 rounded-md object-contain"
                          />
                          <span className="text-sm font-semibold text-foreground">{network}</span>
                        </button>
                      );
                    })}
                  </div>
                </label>
              ) : null}

              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-foreground">Numero</span>
                <Input
                  value={form.number}
                  onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))}
                  placeholder={
                    form.kind === "whatsapp" ? "2290197339551" : "01 97 33 95 51"
                  }
                  required
                />
                {form.kind === "whatsapp" ? (
                  <span className="text-xs text-ink-muted">
                    Preferez l&apos;indicatif pays inclus (ex. 229…), sans + ni espaces.
                  </span>
                ) : null}
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setOpenModal(false);
                    setEditingId(null);
                    setForm(initialForm);
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-palm-deep/45 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-xl">
            <h3 className="text-lg font-bold text-palm">Supprimer ce numero ?</h3>
            <p className="mt-2 text-sm text-ink-muted">
              {deleteTarget.kind === "momo"
                ? `${deleteTarget.network ?? ""} · ${deleteTarget.number}`
                : deleteTarget.number}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Annuler
              </Button>
              <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Suppression..." : "Supprimer"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
