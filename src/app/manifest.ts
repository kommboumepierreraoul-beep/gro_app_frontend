import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AgriPulse",
    short_name: "AgriPulse",
    description:
      "Plateforme agricole communautaire pour connecter, vendre et collaborer.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#047857",
    categories: ["business", "productivity", "social"],
    icons: [
      {
        src: "/logo_agri_pulse.ico",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo_agri_pulse.ico",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
