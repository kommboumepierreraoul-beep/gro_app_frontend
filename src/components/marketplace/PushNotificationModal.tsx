"use client";

import { useState } from "react";
import { AlertCircle, Bell, BellOff, CheckCircle2, Loader2, X } from "lucide-react";
import { usePushNotification } from "@/hooks/usePushNotification";
import toast from "react-hot-toast";

export function PushNotificationModal({
  variant = "row",
}: {
  variant?: "row" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const { permission, subscribed, loading, error, isSupported, subscribe, unsubscribe } =
    usePushNotification();

  const handleSubscribe = async () => {
    const ok = await subscribe();
    if (ok) toast.success("Notifications push activees");
  };

  const handleUnsubscribe = async () => {
    const ok = await unsubscribe();
    if (ok) toast.success("Notifications push desactivees");
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title={subscribed ? "Notifications push activees" : "Activer les notifications push"}
          aria-label="Gerer les notifications push"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#42493e] transition hover:bg-[#eaf3de] hover:text-[#154212]"
        >
          {subscribed ? <CheckCircle2 className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          <span
            className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-[#f9faf2] ${
              subscribed ? "bg-[#2d5a27]" : "bg-amber-500"
            }`}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#42493e] transition hover:bg-[#eaf3de] hover:text-[#154212]"
        >
          <Bell className="h-4 w-4" />
          <span>{subscribed ? "Notifications activees" : "Notifications push"}</span>
        </button>
      )}

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#c2c9bb]/40 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#c2c9bb]/30 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf3de] text-[#154212]">
                  {subscribed ? <CheckCircle2 className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-base font-black text-[#191c18]">Notifications push</h2>
                  <p className="text-xs font-medium text-[#72796e]">
                    Alertes boutique, commandes et moderation.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-[#72796e] transition hover:bg-[#eef3ea] hover:text-[#191c18]"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="rounded-xl border border-[#c2c9bb]/35 bg-[#f9fbf5] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#72796e]">
                      Etat
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#191c18]">
                      {subscribed
                        ? "Actives sur cet appareil"
                        : permission === "denied"
                          ? "Bloquees par le navigateur"
                          : "Non activees"}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#154212]">
                    {permission}
                  </span>
                </div>
              </div>

              {!isSupported ? (
                <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  Ce navigateur ne supporte pas les notifications push.
                </div>
              ) : null}

              {error ? (
                <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              ) : null}

              {permission === "denied" ? (
                <p className="text-sm leading-6 text-[#5c6258]">
                  Les notifications sont bloquees. Autorise-les dans les reglages du site du navigateur,
                  puis reviens activer les alertes ici.
                </p>
              ) : (
                <p className="text-sm leading-6 text-[#5c6258]">
                  Active les alertes pour recevoir les changements importants sans garder la page ouverte.
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#c2c9bb]/30 bg-[#f9fbf5] px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-[#c2c9bb]/45 px-4 py-2.5 text-sm font-bold text-[#42493e] transition hover:bg-white"
              >
                Fermer
              </button>
              {subscribed ? (
                <button
                  type="button"
                  onClick={handleUnsubscribe}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#611a15] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#7f241d] disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
                  Desactiver
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={loading || !isSupported || permission === "denied"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#154212] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2d5a27] disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                  Activer
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
