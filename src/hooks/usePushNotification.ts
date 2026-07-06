"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import api from '@/lib/axios';

function getPushErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const maybeAxios = error as {
      code?: string;
      message?: string;
      response?: { data?: { message?: string } };
    };

    if (maybeAxios.response?.data?.message) {
      return maybeAxios.response.data.message;
    }

    if (
      maybeAxios.code === "ERR_NETWORK" ||
      maybeAxios.message?.includes("Network Error")
    ) {
      return "Connexion au serveur interrompue. Verifiez que le backend est lance et que le reseau est stable.";
    }
  }

  return "Impossible d'activer les notifications push pour le moment.";
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }
  return output;
}

export function usePushNotification() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "default";
    return Notification.permission;
  });
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!isSupported) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    } catch (err) {
      console.error('Erreur verification abonnement push:', err);
      setSubscribed(false);
    }
  }, [isSupported]);

  useEffect(() => {
    if (isSupported) {
      if (Notification.permission === 'granted') checkSubscription();
    }
  }, [checkSubscription, isSupported]);

  const subscribe = async () => {
    setError(null);

    if (!isSupported) {
      setError('Votre navigateur ne supporte pas les notifications push.');
      return false;
    }

    try {
      setLoading(true);
      // Demander permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setError(perm === 'denied'
          ? 'Les notifications sont bloquees dans les reglages du navigateur.'
          : 'Permission de notification non accordee.');
        return false;
      }

      // Enregistrer le service worker
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Récupérer la clé VAPID
      const { data } = await api.get('/push/vapid-key');
      const applicationServerKey = urlBase64ToUint8Array(data.public_key);

      // S'abonner
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const subJson = subscription.toJSON();

      // Envoyer au backend
      await api.post('/push/subscribe', {
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
      });

      setSubscribed(true);
      return true;
    } catch (err) {
      console.error('Erreur abonnement push:', err);
      setError(getPushErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setError(null);

    if (!isSupported) return false;

    try {
      setLoading(true);
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.post('/push/unsubscribe', { endpoint: sub.endpoint });
        await sub.unsubscribe();
        setSubscribed(false);
      }
      return true;
    } catch (err) {
      console.error('Erreur desabonnement push:', err);
      setError(getPushErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { permission, subscribed, loading, error, isSupported, subscribe, unsubscribe };
}
