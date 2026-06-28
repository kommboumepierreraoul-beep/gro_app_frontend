import { ReactNode } from "react";

export const SOCIAL_COLORS = {
  whatsapp: "#25D366",
  facebook: "#1877F2",
  x: "#191c18",
  email: "#805533",
} as const;

export interface SocialItem {
  name: string;
  bg: string;
  icon: ReactNode;
  link: string;
}

export function buildSocialLinks(
  encodedText: string,
  encodedUrl: string,
): SocialItem[] {
  return [
    {
      name: "WhatsApp",
      bg: SOCIAL_COLORS.whatsapp,
      icon: (
        <svg
          className="w-4 h-4 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M20.5 3.5A11.8 11.8 0 0012 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.2 1.6 6L0 24l6.3-1.7a12 12 0 005.7 1.5c6.6 0 12-5.3 12-11.9 0-3.2-1.3-6.2-3.5-8.4z" />
        </svg>
      ),
      link: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: "Facebook",
      bg: SOCIAL_COLORS.facebook,
      icon: (
        <svg
          className="w-4 h-4 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M22 12a10 10 0 10-11.5 9.9v-7H8.9V12h1.6V9.8c0-1.6 1-2.5 2.4-2.5h1.4v1.6h-.8c-.8 0-1 .5-1 1v2h1.8l-.3 2.9h-1.5v7A10 10 0 0022 12z" />
        </svg>
      ),
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "X",
      bg: SOCIAL_COLORS.x,
      icon: (
        <svg
          className="w-4 h-4 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M18.9 2H22l-7 8 8 12h-6.8l-5.3-6.6L4.9 22H2l7.5-8.6L1 2h6.9l4.8 6.2L18.9 2z" />
        </svg>
      ),
      link: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: "Email",
      bg: SOCIAL_COLORS.email,
      icon: (
        <svg
          className="w-4 h-4 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      ),
      link: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
    },
  ];
}
