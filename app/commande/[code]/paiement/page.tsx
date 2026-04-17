import { PaiementRetourClient } from "@/components/commande/paiement-retour-client";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function PaiementRetourPage({ params }: PageProps) {
  const { code } = await params;
  return (
    <section className="mx-auto max-w-lg">
      <PaiementRetourClient orderCode={code} />
    </section>
  );
}
