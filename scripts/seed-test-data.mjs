/**
 * Seed ~20 produits + ~20 commandes dans la base locale (dev).
 * Usage: node scripts/seed-test-data.mjs
 */
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/e_commande_dev";

const images = [
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
];

const productSeeds = [
  ["Poulet braise", "Poulet grille au feu doux, servi avec aloko.", 5500, "Grillades"],
  ["Riz sauce graine", "Portion genereuse, sauce riche et epicee.", 3500, "Plats principaux"],
  ["Poisson capitaine", "Poisson entier, legumes et attieke.", 7000, "Poissons"],
  ["Jus gingembre", "Boisson maison legere et rafraichissante.", 1500, "Boissons"],
  ["Attieke poisson", "Attieke frais avec poisson grille.", 4500, "Poissons"],
  ["Amiwo dinde", "Pate de mais rouge a la dinde.", 4000, "Plats principaux"],
  ["Brochettes boeuf", "Brochettes marinees, oignons et piment.", 3000, "Grillades"],
  ["Frites poulet", "Frites croustillantes et poulet pane.", 3500, "Grillades"],
  ["Salade locale", "Legumes frais de saison.", 2500, "Entrees"],
  ["Soupe agouti", "Soupe traditionnelle maison.", 5000, "Entrees"],
  ["Igname pilee", "Igname pilee sauce arachide.", 3800, "Plats principaux"],
  ["Pizza maison", "Base tomate, fromage, garniture au choix.", 4500, "Plats principaux"],
  ["Burger maison", "Pain frais, viande grillee, sauce speciale.", 4000, "Grillades"],
  ["Coca Cola", "Canette 33cl bien fraiche.", 1000, "Boissons"],
  ["Jus bissap", "Infusion hibiscus sucree legerement.", 1200, "Boissons"],
  ["Beignets haricot", "Beignets croustillants, portion de 6.", 1500, "Entrees"],
  ["Akassa sauce", "Akassa avec sauce tomate pimentee.", 2800, "Plats principaux"],
  ["Crepes sucrees", "Crepes nature ou chocolat.", 2000, "Desserts"],
  ["Salade de fruits", "Fruits frais du marche.", 2200, "Desserts"],
  ["Alloco special", "Banane plantain frite, piment oignon.", 2000, "Entrees"],
];

const customers = [
  ["Koffi Mensah", "0197000001", "Cotonou, Akpakpa"],
  ["Amina Sow", "0197000002", "Cotonou, Ganhi"],
  ["Paul Dossou", "0197000003", "Abomey-Calavi"],
  ["Fatou Diallo", "0197000004", "Porto-Novo"],
  ["Yves Agbodjan", "0197000005", "Cotonou, Fidjrosse"],
  ["Rita Hounsou", "0197000006", "Godomey"],
  ["Serge Adjo", "0197000007", "Cotonou, Cadjehoun"],
  ["Nadine Kpade", "0197000008", "Cotonou, Zongo"],
  ["Marc Tossou", "0197000009", "Ouidah"],
  ["Julie Adjin", "0197000010", "Cotonou, Haie Vive"],
];

const statuses = ["en_attente", "paye", "pret"];
const payments = ["pending", "paid", "paid"];
const deliveries = ["livraison", "retrait"];

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    image: String,
    category: String,
    available: Boolean,
  },
  { timestamps: true },
);

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: String,
        name: String,
        quantity: Number,
        price: Number,
        image: String,
      },
    ],
    total: Number,
    status: String,
    deliveryType: String,
    customerInfo: {
      name: String,
      phone: String,
      address: String,
    },
    orderCode: { type: String, unique: true },
    paymentStatus: String,
    paidAt: Date,
  },
  { timestamps: true },
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

function orderCode(i) {
  const stamp = String(Date.now()).slice(-6);
  return `ILO-${stamp}-${String(100 + i).padStart(3, "0")}`;
}

await mongoose.connect(uri);

const products = await Product.insertMany(
  productSeeds.map(([name, description, price, category], i) => ({
    name,
    description,
    price,
    category,
    available: i % 7 !== 0 || i === 0,
    image: images[i % images.length],
  })),
);

const orders = [];
for (let i = 0; i < 20; i++) {
  const status = statuses[i % statuses.length];
  const paymentStatus = status === "en_attente" ? "pending" : payments[i % payments.length];
  const deliveryType = deliveries[i % deliveries.length];
  const customer = customers[i % customers.length];
  const p1 = products[i % products.length];
  const p2 = products[(i + 3) % products.length];
  const qty1 = 1 + (i % 3);
  const qty2 = 1 + ((i + 1) % 2);
  const items = [
    {
      productId: String(p1._id),
      name: p1.name,
      quantity: qty1,
      price: p1.price,
      image: p1.image,
    },
    {
      productId: String(p2._id),
      name: p2.name,
      quantity: qty2,
      price: p2.price,
      image: p2.image,
    },
  ];
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  orders.push({
    items,
    total,
    status,
    deliveryType,
    customerInfo: {
      name: customer[0],
      phone: customer[1],
      address: deliveryType === "livraison" ? customer[2] : "",
    },
    orderCode: orderCode(i),
    paymentStatus,
    paidAt: paymentStatus === "paid" ? new Date(Date.now() - i * 3600_000) : undefined,
    createdAt: new Date(Date.now() - i * 7200_000),
    updatedAt: new Date(Date.now() - i * 3600_000),
  });
}

await Order.insertMany(orders);

console.log(
  JSON.stringify({
    ok: true,
    products: products.length,
    orders: orders.length,
    db: uri,
  }),
);

await mongoose.disconnect();
