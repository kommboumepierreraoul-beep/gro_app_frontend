// Avatar Debug Component
// Utilise ce composant pour diagnostiquer les problèmes d'affichage d'avatar

"use client";

import { useEffect, useState } from "react";
import { Avatar } from "./Avatar";

interface AvatarDebugProps {
  src?: string | null;
  firstname?: string;
}

export function AvatarDebug({ src, firstname = "Debug" }: AvatarDebugProps) {
  const [debug, setDebug] = useState<string>("");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const info = `
Avatar Debug Info:
==================
Input src: ${src}
NEXT_PUBLIC_API_URL: ${apiUrl}
Firstname: ${firstname}

URL Constructed:
${!src ? "❌ src is empty/null" : "✅ src exists"}
${src?.startsWith("http") ? "✅ Full URL detected" : "🔧 Relative path - will prepend API URL"}

Expected URL:
${
  !src
    ? "❌ No URL (fallback to initials)"
    : src.startsWith("http")
      ? src
      : `${apiUrl}${src.startsWith("/") ? src : `/${src}`}`
}
    `.trim();

    setDebug(info);
    console.log(info);
  }, [src, firstname]);

  return (
    <div className="p-4 bg-gray-100 rounded-lg space-y-2">
      <div className="flex items-center gap-4">
        <Avatar src={src} firstname={firstname} size="lg" />
        <pre className="text-xs bg-white p-2 rounded overflow-auto max-w-md">
          {debug}
        </pre>
      </div>
    </div>
  );
}
