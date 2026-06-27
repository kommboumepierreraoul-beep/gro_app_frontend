"use client";

import { useState } from "react";

interface MediaUploaderProps {
  onMediaSelected: (file: File | null) => void;
}

export default function MediaUploader({ onMediaSelected }: MediaUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onMediaSelected(file);
    }
  };

  return (
    <div className="mb-3">
      <label className="block">
        <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full rounded" />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  onMediaSelected(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-500">📁 Cliquez ou déposez une image</p>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
}
