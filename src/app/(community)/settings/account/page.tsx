'use client';

import { useState } from 'react';

export default function AccountSecurityPage() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit password change
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Compte & Sécurité</h1>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-bold mb-2">Changer le mot de passe</h2>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-blue-500"
          >
            {showPasswordForm ? 'Annuler' : 'Modifier'}
          </button>

          {showPasswordForm && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <input
                type="password"
                name="current"
                placeholder="Mot de passe actuel"
                value={passwords.current}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="password"
                name="new"
                placeholder="Nouveau mot de passe"
                value={passwords.new}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="password"
                name="confirm"
                placeholder="Confirmer le mot de passe"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Enregistrer
              </button>
            </form>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-bold mb-2">Connexions actives</h2>
          <p className="text-gray-600 mb-3">Gérez vos sessions actives</p>
          <button className="text-red-500">Déconnecter tous les appareils</button>
        </div>
      </div>
    </div>
  );
}
