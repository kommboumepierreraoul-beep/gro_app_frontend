"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  Gavel,
  Headphones,
  LifeBuoy,
  Mail,
  MessageSquare,
  PackageSearch,
  Send,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
} from "lucide-react";

type TicketCategory = "order" | "payment" | "seller" | "dispute" | "account";

const faq = [
  {
    question: "Pourquoi mon produit approuve ne s'affiche pas ?",
    answer:
      "Verifiez que son statut est actif, qu'il est associe a une boutique valide et que le stock est superieur a zero.",
  },
  {
    question: "Comment securiser un paiement wallet ?",
    answer:
      "Le wallet demande un PIN a 4 chiffres pour consulter le solde et valider les transactions.",
  },
  {
    question: "Quand ouvrir un litige ?",
    answer:
      "Ouvrez un litige si la commande est payee mais non livree, si le produit est non conforme ou si le vendeur ne repond plus.",
  },
  {
    question: "Comment devenir vendeur ?",
    answer:
      "Creez une boutique depuis l'espace vendeur, renseignez les informations demandees, puis publiez vos produits.",
  },
];

const guides = [
  {
    href: "/orders",
    label: "Suivre mes commandes",
    icon: Truck,
    description: "Paiement, livraison et confirmation de reception.",
  },
  {
    href: "/wallet",
    label: "Gerer mon wallet",
    icon: Wallet,
    description: "Solde, depot, retrait et securite PIN.",
  },
  {
    href: "/disputes",
    label: "Mes litiges",
    icon: Gavel,
    description: "Suivre les reclamations en cours.",
  },
  {
    href: "/my-shop",
    label: "Support vendeur",
    icon: Store,
    description: "Boutique, catalogue et ventes.",
  },
];

export default function MarketplaceSupportPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [category, setCategory] = useState<TicketCategory>("order");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submitTicket = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Completez le sujet et le message");
      return;
    }

    toast.success("Demande support enregistree");
    setSubject("");
    setMessage("");
    setCategory("order");
  };

  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-2xl border border-[#c2c9bb]/45 bg-white/85 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3b6934]">
              Assistance marketplace
            </p>
            <h1 className="mt-1 text-2xl font-black text-[#191c18]">
              Support
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#72796e]">
              Retrouvez les solutions rapides pour commandes, paiements,
              produits, vendeurs et litiges.
            </p>
          </div>
          <Link
            href="/messages"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#154212] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#2d5a27]"
          >
            <MessageSquare className="h-4 w-4" />
            Ouvrir la messagerie
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SupportMetric
          icon={CheckCircle2}
          label="Paiements"
          value="Securises"
          tone="green"
        />
        <SupportMetric
          icon={ShieldCheck}
          label="Wallet"
          value="PIN requis"
          tone="blue"
        />
        <SupportMetric
          icon={Headphones}
          label="Support"
          value="24h ouvrables"
          tone="amber"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-[#c2c9bb]/45 bg-white/85 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <LifeBuoy className="h-5 w-5 text-[#154212]" />
              <div>
                <h2 className="text-lg font-black text-[#191c18]">
                  Guides rapides
                </h2>
                <p className="text-sm text-[#72796e]">
                  Accedez directement aux espaces qui resolvent la plupart des
                  demandes.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {guides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className="rounded-xl border border-[#c2c9bb]/40 bg-[#f9faf2] p-4 transition hover:bg-[#eaf3de]"
                  >
                    <Icon className="h-5 w-5 text-[#154212]" />
                    <p className="mt-3 text-sm font-black text-[#191c18]">
                      {guide.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#72796e]">
                      {guide.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-[#c2c9bb]/45 bg-white/85 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#154212]" />
              <div>
                <h2 className="text-lg font-black text-[#191c18]">FAQ</h2>
                <p className="text-sm text-[#72796e]">
                  Questions frequentes de la marketplace.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {faq.map((item, index) => (
                <button
                  key={item.question}
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full rounded-xl border border-[#c2c9bb]/40 bg-[#f9faf2] p-4 text-left transition hover:bg-[#eaf3de]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-[#191c18]">
                      {item.question}
                    </p>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#3b6934] transition ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {openFaq === index && (
                    <p className="mt-3 text-sm leading-6 text-[#72796e]">
                      {item.answer}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#c2c9bb]/45 bg-white/85 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#154212]" />
              <div>
                <h2 className="text-lg font-black text-[#191c18]">
                  Contacter le support
                </h2>
                <p className="text-sm text-[#72796e]">
                  Decrivez le probleme pour preparer un ticket.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[#191c18]">
                  Categorie
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { value: "order", label: "Commande", icon: PackageSearch },
                    { value: "payment", label: "Paiement", icon: CreditCard },
                    { value: "seller", label: "Vendeur", icon: Store },
                    { value: "dispute", label: "Litige", icon: Gavel },
                    { value: "account", label: "Compte", icon: ShieldCheck },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setCategory(option.value as TicketCategory)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                          category === option.value
                            ? "border-[#154212] bg-[#154212] text-white"
                            : "border-[#c2c9bb]/60 bg-white text-[#42493e] hover:bg-[#eaf3de]"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-[#191c18]">
                  Sujet
                </label>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Ex: paiement wallet refuse"
                  className="mt-2 h-11 w-full rounded-xl border border-[#c2c9bb]/55 bg-white px-3 text-sm outline-none transition focus:border-[#154212] focus:ring-2 focus:ring-[#bcf0ae]/35"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-[#191c18]">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Expliquez ce qui s'est passe, avec numero de commande si possible."
                  rows={5}
                  className="mt-2 w-full resize-none rounded-xl border border-[#c2c9bb]/55 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#154212] focus:ring-2 focus:ring-[#bcf0ae]/35"
                />
              </div>
              <button
                onClick={submitTicket}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#154212] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2d5a27]"
              >
                <Send className="h-4 w-4" />
                Envoyer la demande
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <h2 className="text-sm font-black text-amber-900">
                  Cas urgent
                </h2>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Pour une commande payee non livree, ouvrez directement un
                  litige depuis la page commandes afin de conserver les preuves.
                </p>
                <Link
                  href="/orders"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-800"
                >
                  Aller aux commandes
                </Link>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function SupportMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "green" | "blue" | "amber";
}) {
  const toneClass = {
    green: "bg-[#eaf3de] text-[#154212]",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white/85 p-4 shadow-sm">
      <div className={`inline-flex rounded-xl p-2 ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#72796e]">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-[#191c18]">{value}</p>
    </div>
  );
}
