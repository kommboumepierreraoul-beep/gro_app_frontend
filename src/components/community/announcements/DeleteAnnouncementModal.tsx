/* eslint-disable react/no-unescaped-entities */
// components/announcements/DeleteAnnouncementModal.tsx
import { Trash2 } from "lucide-react";

interface DeleteAnnouncementModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function DeleteAnnouncementModal({
  onConfirm,
  onCancel,
  isPending,
}: DeleteAnnouncementModalProps) {
  const overlayStyle = {
    background: "rgba(15,25,12,0.6)",
    backdropFilter: "blur(8px)",
  };

  const modalStyle = {
    background: "rgba(249,250,242,0.98)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(194,201,187,0.5)",
    boxShadow: "0 24px 60px rgba(21,66,18,0.2)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={overlayStyle}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Supprimer l'annonce
            </h3>
            <p className="text-sm text-gray-600">
              Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action
              est irréversible.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
