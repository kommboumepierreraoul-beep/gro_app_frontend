"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Globe,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Upload,
  X,
} from "lucide-react";

export function CreateShopSkeleton() {
  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-2xl bg-[#f9faf2] p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-[#e7e9e1]" />
        <div className="h-6 w-40 animate-pulse rounded bg-[#dce2d8]" />
        <div className="h-10 w-10 animate-pulse rounded-xl bg-[#e7e9e1]" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="h-72 animate-pulse rounded-3xl bg-[#dce2d8] lg:h-[560px]" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="rounded-2xl border border-[#c2c9bb]/35 bg-white p-4">
              <div className="flex gap-3">
                <div className="h-11 w-11 animate-pulse rounded-xl bg-[#eaf3de]" />
                <div className="flex-1">
                  <div className="h-5 w-1/2 animate-pulse rounded bg-[#dce2d8]" />
                  <div className="mt-2 h-3 w-full animate-pulse rounded bg-[#e7e9e1]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const benefits = [
  {
    icon: Store,
    title: "Une vitrine claire",
    text: "Présentez vos produits, votre boutique et vos contacts dans l’espace vendeur.",
  },
  {
    icon: Package,
    title: "Catalogue maîtrisé",
    text: "Publiez vos produits, suivez les stocks et gardez vos offres visibles.",
  },
  {
    icon: CreditCard,
    title: "Paiements suivis",
    text: "Commandes, wallet, confirmations et litiges restent reliés à votre activité.",
  },
];

const requirements = [
  "Nom et adresse de la boutique",
  "Logo ou image professionnelle",
  "Téléphone et ville de vente",
  "Description courte de l’activité",
];

export function CreateShopIntro({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: () => void;
}) {
  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-2xl bg-[#f9faf2] p-3 sm:p-5">
      <ShopTopbar title="Créer une boutique" subtitle="Espace vendeur" onBack={onBack} />
      <main className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden rounded-3xl border border-[#c2c9bb]/35 bg-[#11190f] shadow-xl">
          <div className="relative min-h-[420px] lg:min-h-[640px]">
            <Image
              src="/images/cover.png"
              alt="Agripulse marketplace"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 48vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#11190f]/90 via-[#11190f]/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-xs font-bold text-[#bcf0ae] backdrop-blur">
                <BadgeCheck className="h-4 w-4" />
                Boutique vérifiée après configuration
              </div>
              <h2 className="max-w-xl text-3xl font-black leading-tight text-white sm:text-5xl">
                Transformez vos produits agricoles en boutique professionnelle.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/72 sm:text-base">
                Publiez vos produits, suivez les commandes et gérez votre
                activité depuis une interface simple et connectée à la marketplace.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-3xl border border-[#c2c9bb]/35 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#3b6934]">
              Démarrage rapide
            </p>
            <h3 className="mt-2 text-2xl font-black text-[#191c18]">
              Une boutique prête en quelques minutes.
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#72796e]">
              Renseignez l’identité visuelle, les coordonnées et une description.
              Le reste se pilote ensuite depuis votre espace vendeur.
            </p>
            <button
              onClick={onStart}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#154212] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#154212]/15 transition hover:bg-[#2d5a27] active:scale-[0.98] sm:w-auto"
            >
              Démarrer la configuration
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title} className="rounded-2xl border border-[#c2c9bb]/35 bg-white/85 p-4 shadow-sm">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf3de] text-[#154212]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#191c18]">{benefit.title}</h4>
                      <p className="mt-1 text-xs leading-5 text-[#72796e]">{benefit.text}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-3xl border border-[#c2c9bb]/35 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#191c18]">À préparer</h3>
                <p className="text-xs text-[#72796e]">Temps estimé : 5 min</p>
              </div>
            </div>
            <div className="grid gap-2">
              {requirements.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl bg-[#f9faf2] px-3 py-2 text-sm font-semibold text-[#42493e]">
                  <CheckCircle2 className="h-4 w-4 text-[#154212]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#154212]/15 bg-[#154212] p-5 text-white shadow-lg">
            <div className="flex gap-3">
              <ShieldCheck className="h-6 w-6 shrink-0 text-[#bcf0ae]" />
              <div>
                <h3 className="text-sm font-black">Transactions sécurisées</h3>
                <p className="mt-1 text-xs leading-5 text-white/72">
                  Commandes, paiements, livraisons et litiges restent suivis
                  dans l’écosystème AgriPulse.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-3 text-xs font-bold text-white/86">
              <Truck className="h-4 w-4 text-[#bcf0ae]" />
              Suivi vendeur, livraison et wallet connectés.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export function ShopTopbar({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  return (
    <header className="sticky top-16 z-30 mb-5 rounded-2xl border border-[#c2c9bb]/35 bg-white/90 px-3 py-3 shadow-sm backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#42493e] transition hover:bg-[#eaf3de] hover:text-[#154212]"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#72796e]">
            {subtitle}
          </p>
          <h1 className="truncate text-lg font-black text-[#191c18]">{title}</h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#154212] text-white">
          <Store className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}

export function UploadBox({
  label,
  preview,
  onClear,
  onChange,
  square,
}: {
  label: string;
  preview: string | null;
  onClear: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  square?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-black text-[#42493e]">{label}</p>
      <div className={`group relative overflow-hidden rounded-2xl border border-dashed border-[#c2c9bb]/60 bg-[#f9faf2] ${square ? "aspect-square" : "aspect-[16/7]"}`}>
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={label} className="h-full w-full object-cover" />
            <button type="button" onClick={onClear} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-sm" aria-label={`Retirer ${label}`}>
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-5 text-center text-[#72796e]">
            {square ? <Upload className="mb-2 h-8 w-8 text-[#154212]" /> : <ImageIcon className="mb-2 h-8 w-8 text-[#154212]" />}
            <span className="text-sm font-black text-[#42493e]">Ajouter une image</span>
            <span className="mt-1 text-xs">PNG ou JPG recommandé</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={onChange} className="absolute inset-0 cursor-pointer opacity-0" />
      </div>
    </div>
  );
}

export function StepPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[#f9faf2] px-3 py-2 text-sm font-bold text-[#42493e]">
      <Check className="h-4 w-4 text-[#154212]" />
      {children}
    </div>
  );
}

export type ShopFormState = {
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  phone: string;
};

export function ConfigureShopDesign({
  form,
  error,
  isSubmitting,
  logoPreview,
  bannerPreview,
  onBack,
  onSubmit,
  onInputChange,
  onGenerateSlug,
  onLogoChange,
  onBannerChange,
  onClearLogo,
  onClearBanner,
}: {
  form: ShopFormState;
  error: string | null;
  isSubmitting: boolean;
  logoPreview: string | null;
  bannerPreview: string | null;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onGenerateSlug: () => void;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearLogo: () => void;
  onClearBanner: () => void;
}) {
  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-2xl bg-[#f9faf2] p-3 sm:p-5">
      <ShopTopbar title="Nouvelle boutique" subtitle="Configuration" onBack={onBack} />

      <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-4">
          <section className="rounded-3xl border border-[#c2c9bb]/35 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#3b6934]">Etape 1</p>
            <h2 className="mt-2 text-2xl font-black text-[#191c18]">Identite visuelle</h2>
            <p className="mt-2 text-sm leading-6 text-[#72796e]">
              Ajoutez un logo et une banniere pour rendre votre boutique reconnaissable.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-[220px_1fr]">
              <UploadBox label="Logo" preview={logoPreview} onClear={onClearLogo} onChange={onLogoChange} square />
              <UploadBox label="Banniere" preview={bannerPreview} onClear={onClearBanner} onChange={onBannerChange} />
            </div>
          </section>

          <section className="rounded-3xl border border-[#c2c9bb]/35 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#3b6934]">Etape 2</p>
            <h2 className="mt-1 text-xl font-black text-[#191c18]">Informations generales</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Nom de la boutique" required icon={Store}>
                <input id="name" value={form.name} onChange={onInputChange} onBlur={onGenerateSlug} placeholder="Ex: Ferme du Littoral" className="w-full bg-transparent pl-10 outline-none" required />
              </Field>
              <Field label="Adresse URL" required icon={Globe}>
                <input id="slug" value={form.slug} onChange={onInputChange} placeholder="ferme-du-littoral" className="w-full bg-transparent pl-10 font-mono text-sm outline-none" required />
              </Field>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-black text-[#42493e]">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea id="description" rows={5} value={form.description} onChange={onInputChange} placeholder="Presentez vos produits, vos methodes de production et ce qui rend votre boutique fiable." className="w-full resize-y rounded-2xl border border-[#c2c9bb]/45 bg-[#f9faf2]/70 px-4 py-3 text-sm outline-none transition focus:border-[#154212]/30 focus:ring-2 focus:ring-[#bcf0ae]" required />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#c2c9bb]/35 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#3b6934]">Etape 3</p>
            <h2 className="mt-1 text-xl font-black text-[#191c18]">Coordonnees</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Adresse" required icon={Navigation} className="md:col-span-2">
                <input id="address" value={form.address} onChange={onInputChange} placeholder="Quartier, rue, point de repere" className="w-full bg-transparent pl-10 outline-none" required />
              </Field>
              <Field label="Ville" required icon={MapPin}>
                <input id="city" value={form.city} onChange={onInputChange} placeholder="Douala" className="w-full bg-transparent pl-10 outline-none" required />
              </Field>
              <Field label="Telephone" required icon={Phone}>
                <input id="phone" type="tel" value={form.phone} onChange={onInputChange} placeholder="6 12 34 56 78" className="w-full bg-transparent pl-10 outline-none" required />
              </Field>
            </div>
          </section>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <section className="rounded-3xl border border-[#c2c9bb]/35 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#154212] text-[#bcf0ae]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#191c18]">Progression</h3>
                <p className="text-xs text-[#72796e]">3 etapes rapides</p>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <StepPill>Identite visuelle</StepPill>
              <StepPill>Informations</StepPill>
              <StepPill>Coordonnees</StepPill>
            </div>
          </section>

          <section className="rounded-3xl border border-[#154212]/15 bg-[#154212] p-5 text-white shadow-lg">
            <ShieldCheck className="h-6 w-6 text-[#bcf0ae]" />
            <h3 className="mt-4 text-lg font-black">Validation boutique</h3>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Ces informations seront utilisees pour vos produits, commandes, paiements et litiges vendeur.
            </p>
          </section>

          <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#154212] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#154212]/15 transition hover:bg-[#2d5a27] disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creation en cours...
              </>
            ) : (
              <>
                Lancer ma boutique
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          <p className="text-center text-xs leading-5 text-[#72796e]">
            En creant votre boutique, vous acceptez les conditions vendeur AgriPulse.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  icon: Icon,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  icon: React.ElementType;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-black text-[#42493e]">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <span className="relative flex h-12 items-center rounded-2xl border border-[#c2c9bb]/45 bg-[#f9faf2]/70 px-4 text-sm text-[#191c18] transition focus-within:border-[#154212]/30 focus-within:ring-2 focus-within:ring-[#bcf0ae]">
        <Icon className="absolute left-4 h-4 w-4 text-[#72796e]" />
        {children}
      </span>
    </label>
  );
}
