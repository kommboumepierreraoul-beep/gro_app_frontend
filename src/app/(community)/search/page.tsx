"use client";

import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    // Implement search logic
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recherche</h1>
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Rechercher des utilisateurs, posts..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      <div className="mt-4 space-y-4">
        {results.map((result: any) => (
          <div key={result.id} className="border rounded-lg p-4">
            {result.title}
          </div>
        ))}
      </div>
    </div>
  );
}
