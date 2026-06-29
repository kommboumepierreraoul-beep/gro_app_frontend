/**
 * Hook pour construire une URL complète d'avatar
 * Gère les URLs relatives, absolues et externes
 */
export function useAvatarUrl(avatarPath?: string | null): string | undefined {
  if (!avatarPath) return undefined;

  // Si l'avatar a déjà une URL complète (commence par http)
  if (avatarPath.startsWith("http")) {
    return avatarPath;
  }

  // Construire l'URL complète avec l'API de base
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanPath = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;

  return `${apiUrl}${cleanPath}`;
}
