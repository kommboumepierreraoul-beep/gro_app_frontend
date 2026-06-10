// components/community/shared/utils.ts
export const getFullMediaUrl = (url: string): string => {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/storage")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${apiUrl}${url}`;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${apiUrl}/${url}`;
};

export const isVideoFile = (url: string): boolean => {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.includes(ext));
};

export const getMediaType = (
  url: string,
  mimeType?: string,
): "image" | "video" => {
  if (mimeType?.startsWith("video/")) return "video";
  if (isVideoFile(url)) return "video";
  return "image";
};

export const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " Go";
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " Ko";
  return bytes + " o";
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
