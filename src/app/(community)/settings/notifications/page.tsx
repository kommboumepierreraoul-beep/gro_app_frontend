"use client";

import { useState } from "react";

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageAlerts: true,
    postLikes: false,
    comments: true,
  });

  const handleToggle = (key: string) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Préférences de notifications</h1>
      <div className="space-y-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.emailNotifications}
            onChange={() => handleToggle("emailNotifications")}
            className="mr-2"
          />
          Notifications par email
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.pushNotifications}
            onChange={() => handleToggle("pushNotifications")}
            className="mr-2"
          />
          Notifications push
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.messageAlerts}
            onChange={() => handleToggle("messageAlerts")}
            className="mr-2"
          />
          Alertes de messages
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.postLikes}
            onChange={() => handleToggle("postLikes")}
            className="mr-2"
          />
          J'aimes sur les posts
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.comments}
            onChange={() => handleToggle("comments")}
            className="mr-2"
          />
          Commentaires
        </label>
      </div>
    </div>
  );
}
