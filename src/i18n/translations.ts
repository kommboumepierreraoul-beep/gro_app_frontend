export type AppLocale = "fr" | "en";

export const DEFAULT_LOCALE: AppLocale = "fr";

export const LOCALE_LABELS: Record<AppLocale, string> = {
  fr: "Francais",
  en: "English",
};

export const translations = {
  common: {
    search: {
      fr: "Rechercher",
      en: "Search",
    },
    close: {
      fr: "Fermer",
      en: "Close",
    },
    language: {
      fr: "Langue",
      en: "Language",
    },
    switchToFrench: {
      fr: "Passer en francais",
      en: "Switch to French",
    },
    switchToEnglish: {
      fr: "Passer en anglais",
      en: "Switch to English",
    },
  },
  auth: {
    login: {
      fr: "Connexion",
      en: "Login",
    },
    logout: {
      fr: "Se deconnecter",
      en: "Log out",
    },
  },
  navigation: {
    admin: {
      fr: "Admin",
      en: "Admin",
    },
    adminSpace: {
      fr: "Espace admin",
      en: "Admin space",
    },
    profile: {
      fr: "Mon profil",
      en: "My profile",
    },
    settings: {
      fr: "Parametres",
      en: "Settings",
    },
    support: {
      fr: "Aide & support",
      en: "Help & support",
    },
    communityHeadline: {
      fr: "Membre de la communaute",
      en: "Community member",
    },
  },
  community: {
    searchPlaceholder: {
      fr: "Rechercher utilisateurs ou publications...",
      en: "Search users or posts...",
    },
    mobileSearchPlaceholder: {
      fr: "Rechercher...",
      en: "Search...",
    },
  },
  marketplace: {
    title: {
      fr: "Marketplace",
      en: "Marketplace",
    },
    subtitle: {
      fr: "Produits, commandes et boutiques",
      en: "Products, orders and shops",
    },
    searchPlaceholder: {
      fr: "Rechercher un produit...",
      en: "Search for a product...",
    },
    add: {
      fr: "Ajouter",
      en: "Add",
    },
    orders: {
      fr: "Commandes",
      en: "Orders",
    },
    notifications: {
      fr: "Notifications",
      en: "Notifications",
    },
  },
} as const;

export type TranslationKey =
  | "common.search"
  | "common.close"
  | "common.language"
  | "common.switchToFrench"
  | "common.switchToEnglish"
  | "auth.login"
  | "auth.logout"
  | "navigation.admin"
  | "navigation.adminSpace"
  | "navigation.profile"
  | "navigation.settings"
  | "navigation.support"
  | "navigation.communityHeadline"
  | "community.searchPlaceholder"
  | "community.mobileSearchPlaceholder"
  | "marketplace.title"
  | "marketplace.subtitle"
  | "marketplace.searchPlaceholder"
  | "marketplace.add"
  | "marketplace.orders"
  | "marketplace.notifications";
