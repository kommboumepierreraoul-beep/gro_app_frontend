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
  const [content, setContent] = useState("");
  const [medias, setMedias] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 4);
    setMedias(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!content.trim() && medias.length === 0) return;
    const form = new FormData();
    form.append("content", content);
    form.append("type", medias.length > 0 ? "image" : "text");
    medias.forEach((f) => form.append("media[]", f));
    await createPost.mutateAsync(form);
    setContent("");
    setMedias([]);
    setPreviews([]);
    setOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <Avatar src={user?.avatar} firstname={user?.firstname} size="md" />
        <button
          onClick={() => setOpen(true)}
          className="flex-1 text-left px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-sm text-gray-400 transition"
        >
          Quoi de neuf, {user?.firstname} ?
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
        {[
          {
            icon: "🖼️",
            label: "Photo/Vidéo",
            action: () => {
              setOpen(true);
              setTimeout(() => fileRef.current?.click(), 100);
            },
          },
          { icon: "📄", label: "Article", action: () => setOpen(true) },
          { icon: "📣", label: "Annonce", action: () => setOpen(true) },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-gray-50 text-xs text-gray-500 font-medium transition"
          >
            <span>{btn.icon}</span> {btn.label}
          </button>
        ))}
      </div>

      {/* Modal de création */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Créer une publication</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={user?.avatar}
                  firstname={user?.firstname}
                  size="md"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstname} {user?.lastname}
                  </p>
                  <p className="text-xs text-gray-400">Publication publique</p>
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Quoi de neuf, ${user?.firstname} ?`}
                rows={4}
                autoFocus
                className="w-full resize-none outline-none text-gray-800 placeholder-gray-300 text-sm"
              />

              {/* Aperçu des images */}
              {previews.length > 0 && (
                <div
                  className={`grid gap-2 ${previews.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                >
                  {previews.map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-video rounded-xl overflow-hidden bg-gray-100"
                    >
                      <Image src={src} alt="" fill className="object-cover" />
                      <button
                        onClick={() => {
                          setMedias((m) => m.filter((_, j) => j !== i));
                          setPreviews((p) => p.filter((_, j) => j !== i));
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-2">
                <span className="text-xs text-gray-500 font-medium pl-1">
                  Ajouter à votre publication :
                </span>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition text-lg"
                  title="Photo/Vidéo"
                >
                  🖼️
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                disabled={
                  createPost.isPending ||
                  (!content.trim() && medias.length === 0)
                }
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-sm"
              >
                {createPost.isPending ? "Publication..." : "Publier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
