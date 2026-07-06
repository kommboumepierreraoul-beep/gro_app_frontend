"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Bell,
  CreditCard,
  Eye,
  Globe2,
  LockKeyhole,
  Mail,
  MessageSquare,
  RotateCcw,
  Save,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Truck,
} from "lucide-react";

type Settings = {
  orderNotifications: boolean;
  sellerNotifications: boolean;
  disputeAlerts: boolean;
  promoEmails: boolean;
  showPhoneToSellers: boolean;
  allowSellerMessages: boolean;
  defaultDelivery: "pickup" | "delivery" | "both";
  paymentReminder: boolean;
  compactCatalog: boolean;
  language: "fr" | "en";
};

const defaultSettings: Settings = {
  orderNotifications: true,
  sellerNotifications: true,
  disputeAlerts: true,
  promoEmails: false,
  showPhoneToSellers: false,
  allowSellerMessages: true,
  defaultDelivery: "both",
  paymentReminder: true,
  compactCatalog: false,
  language: "fr",
};

const storageKey = "marketplace_settings";

export default function MarketplaceSettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") return defaultSettings;

    const raw = localStorage.getItem(storageKey);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const activeCount = useMemo(
    () =>
      Object.values(settings).filter((value) => value === true).length,
    [settings],
  );

  const updateSetting = <Key extends keyof Settings>(
    key: Key,
    value: Settings[Key],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
    const stamp = new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    setSavedAt(stamp);
    toast.success("Parametres marketplace enregistres");
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(storageKey);
    setSavedAt(null);
    toast.success("Parametres reinitialises");
  };

  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-2xl border border-[#c2c9bb]/45 bg-white/85 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3b6934]">
              Marketplace
            </p>
            <h1 className="mt-1 text-2xl font-black text-[#191c18]">
              Parametres
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#72796e]">
              Ajustez vos preferences d&apos;achat, de vente, de confidentialite
              et de notifications pour l&apos;espace marketplace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={resetSettings}
              className="inline-flex items-center gap-2 rounded-xl border border-[#c2c9bb]/60 bg-white px-4 py-2 text-sm font-bold text-[#42493e] transition hover:bg-[#eaf3de]"
            >
              <RotateCcw className="h-4 w-4" />
              Reinitialiser
            </button>
            <button
              onClick={saveSettings}
              className="inline-flex items-center gap-2 rounded-xl bg-[#154212] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#2d5a27]"
            >
              <Save className="h-4 w-4" />
              Enregistrer
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryTile
          icon={SlidersHorizontal}
          label="Regles actives"
          value={String(activeCount)}
        />
        <SummaryTile
          icon={ShieldCheck}
          label="Confidentialite"
          value={settings.showPhoneToSellers ? "Visible" : "Protegee"}
        />
        <SummaryTile
          icon={Globe2}
          label="Langue"
          value={settings.language === "fr" ? "Francais" : "English"}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <SettingsPanel
          title="Notifications"
          description="Controlez ce qui vous alerte pendant les achats, ventes et litiges."
          icon={Bell}
        >
          <ToggleRow
            icon={ShoppingBag}
            label="Commandes et achats"
            description="Reception, paiement, expedition et livraison."
            checked={settings.orderNotifications}
            onChange={(value) => updateSetting("orderNotifications", value)}
          />
          <ToggleRow
            icon={Store}
            label="Activite vendeur"
            description="Nouvelles ventes, validations et avis produits."
            checked={settings.sellerNotifications}
            onChange={(value) => updateSetting("sellerNotifications", value)}
          />
          <ToggleRow
            icon={MessageSquare}
            label="Litiges et mediation"
            description="Alertes prioritaires quand une reponse est attendue."
            checked={settings.disputeAlerts}
            onChange={(value) => updateSetting("disputeAlerts", value)}
          />
          <ToggleRow
            icon={Mail}
            label="Emails promotionnels"
            description="Offres, nouveautes et recommandations."
            checked={settings.promoEmails}
            onChange={(value) => updateSetting("promoEmails", value)}
          />
        </SettingsPanel>

        <SettingsPanel
          title="Confidentialite"
          description="Decidez ce que les vendeurs et acheteurs peuvent voir."
          icon={LockKeyhole}
        >
          <ToggleRow
            icon={Eye}
            label="Afficher mon telephone aux vendeurs"
            description="Utile pour les livraisons directes et retraits."
            checked={settings.showPhoneToSellers}
            onChange={(value) => updateSetting("showPhoneToSellers", value)}
          />
          <ToggleRow
            icon={MessageSquare}
            label="Autoriser les messages vendeurs"
            description="Permet aux vendeurs de vous contacter via la messagerie."
            checked={settings.allowSellerMessages}
            onChange={(value) => updateSetting("allowSellerMessages", value)}
          />
          <ToggleRow
            icon={CreditCard}
            label="Rappel de securite paiement"
            description="Demander une confirmation avant toute action wallet."
            checked={settings.paymentReminder}
            onChange={(value) => updateSetting("paymentReminder", value)}
          />
        </SettingsPanel>

        <SettingsPanel
          title="Achats et livraison"
          description="Preferences appliquees aux parcours commande."
          icon={Truck}
        >
          <div>
            <label className="text-sm font-bold text-[#191c18]">
              Mode de livraison prefere
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { value: "pickup", label: "Retrait" },
                { value: "delivery", label: "Livraison" },
                { value: "both", label: "Les deux" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    updateSetting(
                      "defaultDelivery",
                      option.value as Settings["defaultDelivery"],
                    )
                  }
                  className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                    settings.defaultDelivery === option.value
                      ? "border-[#154212] bg-[#154212] text-white"
                      : "border-[#c2c9bb]/60 bg-white text-[#42493e] hover:bg-[#eaf3de]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <ToggleRow
            icon={SlidersHorizontal}
            label="Catalogue compact"
            description="Affiche plus de produits par ligne sur desktop."
            checked={settings.compactCatalog}
            onChange={(value) => updateSetting("compactCatalog", value)}
          />
        </SettingsPanel>

        <SettingsPanel
          title="Compte marketplace"
          description="Acces rapides aux zones liees a votre profil marchand."
          icon={Store}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickLink href="/account" label="Compte" icon={ShieldCheck} />
            <QuickLink href="/wallet" label="Portefeuille" icon={CreditCard} />
            <QuickLink href="/my-shop" label="Ma boutique" icon={Store} />
            <QuickLink href="/marketplace/support" label="Support" icon={MessageSquare} />
          </div>
          {savedAt && (
            <p className="rounded-xl bg-[#eaf3de] px-3 py-2 text-xs font-semibold text-[#154212]">
              Derniere sauvegarde : {savedAt}
            </p>
          )}
        </SettingsPanel>
      </section>
    </div>
  );
}

function SettingsPanel({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#c2c9bb]/45 bg-white/85 p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3de] text-[#154212]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-[#191c18]">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-[#72796e]">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#c2c9bb]/35 bg-[#f9faf2] p-3">
      <div className="flex min-w-0 items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#3b6934]" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#191c18]">{label}</p>
          <p className="mt-0.5 text-xs leading-5 text-[#72796e]">
            {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-[#154212]" : "bg-[#c2c9bb]"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white/85 p-4 shadow-sm">
      <Icon className="h-5 w-5 text-[#154212]" />
      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#72796e]">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-[#191c18]">{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl border border-[#c2c9bb]/45 bg-[#f9faf2] px-3 py-3 text-sm font-bold text-[#42493e] transition hover:bg-[#eaf3de] hover:text-[#154212]"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
