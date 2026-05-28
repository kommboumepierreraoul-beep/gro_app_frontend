"use client";

import { useState } from "react";

export default function PrivacyPage() {
  const [settings, setSettings] = useState({
    profilePublic: true,
    allowMessages: true,
    showActivity: false,
  });

  const handleToggle = (key: string) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Confidentialité</h1>
      <div className="space-y-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.profilePublic}
            onChange={() => handleToggle("profilePublic")}
            className="mr-2"
          />
          Profil public
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.allowMessages}
            onChange={() => handleToggle("allowMessages")}
            className="mr-2"
          />
          Permettre les messages privés
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showActivity}
            onChange={() => handleToggle("showActivity")}
            className="mr-2"
          />
          Afficher mon activité
        </label>
      </div>
    </div>
  );
}
