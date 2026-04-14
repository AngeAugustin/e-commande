"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type UserRow = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  createdAt?: string;
};

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  role: "ADMIN",
};

export function UsersManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: UserRow[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [form, setForm] = useState(initialForm);
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [referenceNow] = useState(() => Date.now());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  }

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const method = editingId ? "PUT" : "POST";
    const endpoint = editingId ? `/api/users/${editingId}` : "/api/users";
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast.error(data.message || "Creation impossible");
      return;
    }

    if (editingId) {
      toast.success("Utilisateur modifie");
    } else {
      toast.success(
        `Utilisateur cree. Mot de passe par defaut: ${data.defaultPassword}`,
        { duration: 5500 },
      );
    }

    setForm(initialForm);
    setEditingId(null);
    setOpenModal(false);
    loadUsers();
  }

  async function confirmDeleteUser() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/users/${deleteTarget._id}`, { method: "DELETE" });
    const data = await res.json();
    setDeleting(false);

    if (!res.ok) {
      toast.error(data.message || "Suppression impossible");
      return;
    }

    toast.success("Utilisateur supprime");
    setDeleteTarget(null);
    loadUsers();
  }

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((user) => user.role === "admin").length;
    const withName = users.filter((user) => user.firstName || user.lastName).length;
    const recent = users.filter((user) => {
      if (!user.createdAt) return false;
      const createdAt = new Date(user.createdAt).getTime();
      return referenceNow - createdAt < 1000 * 60 * 60 * 24 * 7;
    }).length;
    return [
      { label: "Total utilisateurs", value: String(total) },
      { label: "Admins", value: String(admins) },
      { label: "Profils complets", value: String(withName) },
      { label: "Nouveaux (7 jours)", value: String(recent) },
    ];
  }, [users, referenceNow]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Utilisateurs</h1>
          <p className="text-sm text-zinc-500">
            Creez et suivez les comptes admin du restaurant.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setForm(initialForm);
            setOpenModal(true);
          }}
        >
          Nouvel utilisateur
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-black">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Nom complet</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Creation</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">
                    {[user.firstName || "", user.lastName || ""].join(" ").trim() ||
                      "Non renseigne"}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold uppercase text-zinc-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("fr-FR")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="text-zinc-700 transition hover:text-black"
                        title="Modifier l utilisateur"
                        aria-label="Modifier l utilisateur"
                        onClick={() => {
                          setEditingId(user._id);
                          setForm({
                            firstName: user.firstName || "",
                            lastName: user.lastName || "",
                            email: user.email,
                            role: "ADMIN",
                          });
                          setOpenModal(true);
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 20h4l10-10-4-4L4 16v4Z" />
                          <path d="m12 6 4 4" />
                        </svg>
                      </button>
                      {user._id !== currentUserId ? (
                        <button
                          type="button"
                          className="text-red-600 transition hover:text-red-700"
                          title="Supprimer l utilisateur"
                          aria-label="Supprimer l utilisateur"
                          onClick={() => setDeleteTarget(user)}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 7h16" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
                            <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-zinc-400">Vous</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {openModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <Card className="w-full max-w-xl">
            <h2 className="text-xl font-black">
              {editingId ? "Modifier un utilisateur" : "Creer un utilisateur"}
            </h2>
            <p className="mb-4 text-sm text-zinc-500">
              {editingId
                ? "Mettez a jour les informations de cet administrateur."
                : "Renseignez les informations du nouvel administrateur."}
            </p>

            <form className="grid gap-3 sm:grid-cols-2" onSubmit={submitForm}>
              <Input
                required
                placeholder="Nom"
                value={form.firstName}
                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
              />
              <Input
                required
                placeholder="Prenoms"
                value={form.lastName}
                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
              />
              <Input
                required
                type="email"
                className="sm:col-span-2"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input required className="sm:col-span-2" value={form.role} disabled />

              <div className="flex gap-2 sm:col-span-2 sm:justify-end">
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
                  {saving
                    ? editingId
                      ? "Mise a jour..."
                      : "Creation..."
                    : editingId
                      ? "Mettre a jour"
                      : "Creer"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-xl font-black">Confirmer la suppression</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Voulez-vous vraiment supprimer l utilisateur{" "}
              <span className="font-semibold text-black">{deleteTarget.email}</span> ?
              Cette action est irreversible.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Annuler
              </Button>
              <Button variant="danger" onClick={confirmDeleteUser} disabled={deleting}>
                {deleting ? "Suppression..." : "Confirmer"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
