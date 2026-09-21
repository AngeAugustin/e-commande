/** Étapes publiques — commande en ligne */
export const ORDER_STEPS = [
  {
    label: "Menu",
    title: "Choisissez",
    text: "Parcourez les plats du jour et composez votre panier.",
  },
  {
    label: "Cuisine",
    title: "On prépare",
    text: "Validez, payez par MoMo — la cuisine s’occupe du reste.",
  },
  {
    label: "Comptoir",
    title: "Retirez",
    text: "Suivez l’avancement et passez chercher au restaurant.",
  },
] as const;

/** Parcours détaillé pour la page « Comment ça marche » */
export const HOW_IT_WORKS_DETAILS = [
  {
    step: "01",
    title: "Parcourez le menu",
    text: "Ouvrez la carte, parcourez les plats disponibles et ajoutez ce que vous voulez au panier. Vous pouvez ajuster les quantités à tout moment.",
  },
  {
    step: "02",
    title: "Validez votre commande",
    text: "Dans le panier, vérifiez le total, choisissez retrait ou livraison, puis renseignez vos coordonnées et le réseau MoMo (MTN ou Moov).",
  },
  {
    step: "03",
    title: "Déposez le paiement MoMo",
    text: "Après validation, vous recevez un code de commande et les instructions de dépôt. Effectuez le transfert Mobile Money indiqué.",
  },
  {
    step: "04",
    title: "Suivez et récupérez",
    text: "Sur Suivi, entrez votre code pour voir l’avancement. Dès que c’est prêt, passez au restaurant (ou attendez la livraison).",
  },
] as const;

export const ORDER_STATUS_GUIDE = [
  {
    key: "en_attente",
    label: "Attente dépôt MoMo",
    text: "La commande est enregistrée. Déposez le montant sur le numéro MoMo indiqué.",
  },
  {
    key: "paye",
    label: "Payé",
    text: "Le restaurant a confirmé le paiement. La cuisine prépare votre commande.",
  },
  {
    key: "pret",
    label: "Prêt",
    text: "C’est prêt ! Venez retirer au comptoir, ou attendez la livraison si vous l’avez choisie.",
  },
] as const;
