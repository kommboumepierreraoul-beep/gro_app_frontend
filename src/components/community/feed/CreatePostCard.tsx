"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Avatar } from "../shared/Avatar";
import { useAuthStore } from "@/store/auth.store";
import { useFeed } from "@/hooks/community/useFeed";

export function CreatePostCard() {
  const { user } = useAuthStore();
  const { createPost } = useFeed();

  const [open, setOpen] = useState(false);

  // 🟢 FIX IMPORTANT : jamais undefined
  const [content, setContent] = useState("");

  // 🟢 FIX IMPORTANT : tableau de fichiers
  const [medias, setMedias] = useState<File[]>([]);

  const [previews, setPreviews] = useState<string[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);

  // ─────────────────────────────
  // FILE HANDLER
  // ─────────────────────────────
  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const arr = Array.from(files);

    console.log("FILES SELECTED:", arr); // 🔥 DEBUG

    setMedias(arr);
    setPreviews(arr.map((file) => URL.createObjectURL(file)));
  };

  // ─────────────────────────────
  // SUBMIT POST
  // ─────────────────────────────
  const handleSubmit = async () => {
    if (!content.trim() && medias.length === 0) return;

    console.log("MEDIAS BEFORE SEND:", medias); // 🔥 DOIT afficher File[]

    // 🔥 DEBUG IMPORTANT
    console.log("MEDIAS:", medias);
    console.log("IS FILE:", medias[0] instanceof File);

    const formData = new FormData();

    // 🟡 FIX CRITIQUE : content toujours string
    formData.append("content", content);

    formData.append("type", medias.length > 0 ? "image" : "text");

    // 🟡 FIX IMPORTANT : Laravel attend media[]
    medias.forEach((file) => {
      formData.append("media", file);
    });

    await createPost.mutateAsync({
      content,
      type: medias.length > 0 ? "image" : "text",
      media: medias, // 🔴 FIX : on envoie OBJECT, pas FormData
    });

    // 🟢 RESET STATE
    setContent("");
    setMedias([]);
    setPreviews([]);
    setOpen(false);
  };;

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      {/* INPUT TRIGGER */}
      <div className="flex items-center gap-3">
        <Avatar src={user?.avatar} firstname={user?.firstname} size="md" />

        <button
          onClick={() => setOpen(true)}
          className="flex-1 text-left px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-500"
        >
          Quoi de neuf, {user?.firstname} ?
        </button>
      </div>

      {/* PREVIEW IMAGES */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {previews.map((src, i) => (
            <div key={i} className="relative h-48 overflow-hidden rounded-xl">
              <Image
                src={src}
                alt=""
                width={500}
                height={500}
                className="object-cover w-full h-full"
                unoptimized
              />

              <button
                onClick={() => {
                  setMedias((m) => m.filter((_, j) => j !== i));
                  setPreviews((p) => p.filter((_, j) => j !== i));
                }}
                className="absolute top-2 right-2 bg-black/60 text-white w-6 h-6 rounded-full"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FILE INPUT */}
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,video/*"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* ACTIONS */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="px-3 py-2 text-sm bg-gray-100 rounded-lg"
        >
          📷 Ajouter
        </button>

        <button
          onClick={handleSubmit}
          disabled={createPost.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {createPost.isPending ? "Publication..." : "Publier"}
        </button>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Quoi de neuf ?"
              className="w-full outline-none text-sm"
              rows={4}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setOpen(false)}>Annuler</button>

              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Publier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
