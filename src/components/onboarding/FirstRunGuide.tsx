"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bot,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  PanelsTopLeft,
  ShoppingBasket,
  Sparkles,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

const GUIDE_EVENT = "agripulse:open-onboarding";

type Step = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  href?: string;
  action?: string;
  icon: React.ComponentType<{ className?: string }>;
};

const steps: Step[] = [
  {
    id: "welcome",
    eyebrow: "Premiere ouverture",
    title: "Bienvenue sur AgriPulse",
    description:
      "Ce guide vous montre les espaces essentiels pour publier, vendre, trouver des missions et echanger avec la communaute.",
    icon: Sparkles,
  },
  {
    id: "profile",
    eyebrow: "Votre identite",
    title: "Completez votre profil",
    description:
      "Ajoutez vos informations, votre activite et vos contacts utiles pour inspirer confiance aux autres membres.",
    href: "/profile",
    action: "Voir mon profil",
    icon: UserRound,
  },
  {
    id: "community",
    eyebrow: "Communaute",
    title: "Publiez et participez aux discussions",
    description:
      "La communaute permet de partager des actualites, poser des questions, commenter et suivre les autres acteurs agricoles.",
    href: "/community",
    action: "Ouvrir la communaute",
    icon: PanelsTopLeft,
  },
  {
    id: "marketplace",
    eyebrow: "Marketplace",
    title: "Achetez, vendez et gerez votre boutique",
    description:
      "Explorez le catalogue, contactez les vendeurs, suivez les commandes et ouvrez une boutique si vous souhaitez vendre.",
    href: "/marketplace",
    action: "Explorer le marche",
    icon: ShoppingBasket,
  },
  {
    id: "missions",
    eyebrow: "Missions",
    title: "Publiez ou trouvez des missions agricoles",
    description:
      "Consultez les missions disponibles, postulez, gerez vos candidatures et suivez les notifications de mission.",
    href: "/missions",
    action: "Voir les missions",
    icon: Briefcase,
  },
  {
    id: "messages",
    eyebrow: "Messagerie",
    title: "Echangez avec les membres",
    description:
      "Contactez un vendeur, un auteur ou un prestataire et retrouvez vos conversations dans la messagerie.",
    href: "/messages",
    action: "Ouvrir les messages",
    icon: MessageCircle,
  },
  {
    id: "wallet",
    eyebrow: "Portefeuille",
    title: "Protegez vos paiements",
    description:
      "Configurez votre code PIN pour consulter le solde et valider les transactions sensibles depuis le portefeuille.",
    href: "/wallet",
    action: "Configurer le wallet",
    icon: WalletCards,
  },
  {
    id: "notifications",
    eyebrow: "Alertes",
    title: "Activez les notifications",
    description:
      "Recevez les alertes importantes pour les commandes, missions, messages, moderation et activites de la plateforme.",
    href: "/notifications",
    action: "Gerer les notifications",
    icon: Bell,
  },
  {
    id: "ai",
    eyebrow: "Assistance IA",
    title: "Demandez de l'aide a AgriPulse IA",
    description:
      "Utilisez l'assistant pour reformuler un texte, trouver des idees, resumer ou obtenir une aide agricole generale.",
    href: "/chat-ai",
    action: "Ouvrir l'IA",
    icon: Bot,
  },
];

const checklist = [
  { id: "profile", label: "Completer mon profil", href: "/profile" },
  { id: "notifications", label: "Verifier mes notifications", href: "/notifications" },
  { id: "community", label: "Visiter la communaute", href: "/community" },
  { id: "marketplace", label: "Explorer la marketplace", href: "/marketplace" },
  { id: "missions", label: "Decouvrir les missions", href: "/missions" },
];

function storageKey(userId: number | string | undefined) {
  return `agripulse_onboarding_done_${userId ?? "guest"}`;
}

function checklistKey(userId: number | string | undefined) {
  return `agripulse_onboarding_checklist_${userId ?? "guest"}`;
}

export function FirstRunGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isHydrated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const currentStep = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const userKey = user?.id ?? user?.email;
  const isAuthPage = pathname?.startsWith("/login") || pathname?.includes("(auth)");

  const completedCount = useMemo(
    () => checklist.filter((item) => checked[item.id]).length,
    [checked],
  );

  useEffect(() => {
    if (!isHydrated || !user || isAuthPage) return;

    const done = localStorage.getItem(storageKey(userKey));
    const savedChecklist = localStorage.getItem(checklistKey(userKey));

    if (savedChecklist) {
      try {
        const parsedChecklist = JSON.parse(savedChecklist);
        queueMicrotask(() => setChecked(parsedChecklist));
      } catch {
        queueMicrotask(() => setChecked({}));
      }
    }

    if (!done) {
      const timer = window.setTimeout(() => setOpen(true), 650);
      return () => window.clearTimeout(timer);
    }
  }, [isAuthPage, isHydrated, user, userKey]);

  useEffect(() => {
    const openGuide = () => {
      setStepIndex(0);
      setOpen(true);
    };

    window.addEventListener(GUIDE_EVENT, openGuide);
    return () => window.removeEventListener(GUIDE_EVENT, openGuide);
  }, []);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(checklistKey(userKey), JSON.stringify(checked));
  }, [checked, user, userKey]);

  if (!isHydrated || !user || !open || isAuthPage) {
    return null;
  }

  const closeGuide = () => {
    localStorage.setItem(storageKey(userKey), "true");
    setOpen(false);
  };

  const goToStepAction = () => {
    if (currentStep.href) {
      setChecked((prev) => ({ ...prev, [currentStep.id]: true }));
      closeGuide();
      router.push(currentStep.href);
    }
  };

  const toggleChecklist = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#10170f]/55 px-4 py-6 backdrop-blur-sm">
      <div className="grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl border border-[#c2c9bb]/60 bg-[#f9faf2] shadow-2xl lg:grid-cols-[1.15fr_0.85fr]">
        <section className="min-h-0 overflow-y-auto bg-white">
          <div className="flex items-center justify-between border-b border-[#c2c9bb]/35 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eaf3de] text-[#154212]">
                <StepIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3b6934]">
                  Guide de demarrage
                </p>
                <p className="text-sm font-semibold text-[#72796e]">
                  Etape {stepIndex + 1} sur {steps.length}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeGuide}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#72796e] transition hover:bg-[#eef3ea] hover:text-[#191c18]"
              aria-label="Fermer le guide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="h-1 bg-[#e7e9e1]">
            <div
              className="h-full bg-[#154212] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#3b6934]">
                {currentStep.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-black leading-tight text-[#191c18] sm:text-3xl">
                {currentStep.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#5c6258] sm:text-base">
                {currentStep.description}
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {steps.slice(1, 4).map((item) => {
                const Icon = item.icon;
                const active = item.id === currentStep.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStepIndex(steps.findIndex((step) => step.id === item.id))}
                    className={`rounded-lg border p-3 text-left transition ${
                      active
                        ? "border-[#154212] bg-[#eaf3de]"
                        : "border-[#c2c9bb]/40 bg-[#f9faf2] hover:bg-[#eef3ea]"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-[#154212]" />
                    <p className="mt-2 text-xs font-bold text-[#191c18]">
                      {item.eyebrow}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
                disabled={stepIndex === 0}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#c2c9bb]/60 px-4 text-sm font-bold text-[#42493e] transition hover:bg-[#f9faf2] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft className="h-4 w-4" />
                Precedent
              </button>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                {currentStep.href ? (
                  <button
                    type="button"
                    onClick={goToStepAction}
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-[#154212]/25 bg-[#eaf3de] px-4 text-sm font-black text-[#154212] transition hover:bg-[#dcefd0]"
                  >
                    {currentStep.action}
                  </button>
                ) : null}
                {stepIndex === steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={closeGuide}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-[#154212] px-5 text-sm font-black text-white transition hover:bg-[#2d5a27]"
                  >
                    Terminer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStepIndex((index) => Math.min(steps.length - 1, index + 1))}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#154212] px-5 text-sm font-black text-white transition hover:bg-[#2d5a27]"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="min-h-0 overflow-y-auto border-t border-[#c2c9bb]/35 bg-[#f9faf2] p-5 lg:border-l lg:border-t-0">
          <div className="rounded-lg border border-[#c2c9bb]/45 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#72796e]">
                  Checklist
                </p>
                <h3 className="mt-1 text-lg font-black text-[#191c18]">
                  Premiers pas
                </h3>
              </div>
              <span className="rounded-full bg-[#eaf3de] px-3 py-1 text-xs font-black text-[#154212]">
                {completedCount}/{checklist.length}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#c2c9bb]/35 bg-[#f9faf2] p-3"
                >
                  <button
                    type="button"
                    onClick={() => toggleChecklist(item.id)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                      checked[item.id]
                        ? "border-[#154212] bg-[#154212] text-white"
                        : "border-[#aeb7a8] bg-white text-transparent"
                    }`}
                    aria-label={`Marquer ${item.label}`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChecked((prev) => ({ ...prev, [item.id]: true }));
                      closeGuide();
                      router.push(item.href);
                    }}
                    className="min-w-0 flex-1 text-left text-sm font-bold text-[#42493e] transition hover:text-[#154212]"
                  >
                    {item.label}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[#c2c9bb]/45 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#72796e]">
              Astuce
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5c6258]">
              Vous pouvez passer ce guide maintenant et le relancer depuis le
              bouton aide dans la barre de navigation.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function openFirstRunGuide() {
  window.dispatchEvent(new Event(GUIDE_EVENT));
}
