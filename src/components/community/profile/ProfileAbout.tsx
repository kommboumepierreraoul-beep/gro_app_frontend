"use client";

export default function ProfileAbout() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h3 className="font-bold mb-3">À propos</h3>
      <div className="space-y-2 text-sm">
        <div>
          <p className="text-gray-500">Titre professionnel</p>
          <p className="font-semibold">Développeur Full Stack</p>
        </div>
        <div>
          <p className="text-gray-500">Entreprise</p>
          <p className="font-semibold">Tech Company</p>
        </div>
        <div>
          <p className="text-gray-500">Localisation</p>
          <p className="font-semibold">Paris, France</p>
        </div>
      </div>
    </div>
  );
}
