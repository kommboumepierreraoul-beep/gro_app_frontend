"use client";
import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch (err) {
        console.error("Erreur profil:", err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div>
      {user ? (
        <p>
          Bienvenue {user.firstname} {user.lastname} 🎉
        </p>
      ) : (
        <p>Chargement du profil...</p>
      )}
    </div>
  );
}
