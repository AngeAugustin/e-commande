"use client";

export default function ErrorPage() {
  return (
    <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <h2 className="text-xl font-bold text-red-700">Une erreur est survenue</h2>
      <p className="mt-2 text-sm text-red-600">
        Veuillez reessayer dans quelques secondes.
      </p>
    </section>
  );
}
