"use client";

import { useState, useEffect } from "react";
import { X, Star, Check } from "lucide-react";
import { useMissionStore } from "@/stores/useMissionStore";
import { useSubmitReview } from "@/hooks/missions/useMissionMutate";
import { useMission } from "@/hooks/missions/useMissions";

export default function ReviewModal() {
  const reviewModalMission = useMissionStore((s) => s.reviewModalMission);
  const closeReviewModal = useMissionStore((s) => s.closeReviewModal);
  const submitReview = useSubmitReview();

  const { data: mission } = useMission(reviewModalMission?.ulid ?? "");

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReviewModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeReviewModal]);

  if (!reviewModalMission || !mission) return null;

  const isAuthorReview = reviewModalMission.direction === "author_to_applicant";

  const handleSubmit = () => {
    if (rating === 0) return;

    submitReview.mutate(
      {
        ulid: reviewModalMission.ulid,
        rating,
        comment: comment || undefined,
        direction: reviewModalMission.direction,
        reviewee_id: reviewModalMission.revieweeId,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(closeReviewModal, 1500);
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#2e312c]/40 backdrop-blur-sm"
        onClick={closeReviewModal}
      />

      <div className="relative bg-[#f9faf2] rounded-3xl w-full max-w-md shadow-2xl border border-[#c2c9bb]/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#c2c9bb]/20 bg-[#f3f4ed]">
          <div>
            <h2 className="font-[Plus_Jakarta_Sans] font-semibold text-[#191c18] text-base">
              {isAuthorReview ? "Évaluer le candidat" : "Évaluer la mission"}
            </h2>
            <p className="text-xs text-[#72796e] mt-0.5 line-clamp-1">
              {mission.title}
            </p>
          </div>
          <button
            onClick={closeReviewModal}
            className="p-2 hover:bg-[#edefe7] rounded-full transition-colors text-[#42493e]"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-[#eaf3de] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-[#154212]" />
            </div>
            <h3 className="font-semibold text-[#191c18] mb-1">
              Merci pour votre avis !
            </h3>
            <p className="text-sm text-[#72796e]">
              Votre évaluation aide la communauté GRO.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <p className="text-sm text-[#42493e]">
              {isAuthorReview
                ? "Comment évaluez-vous le sérieux, la ponctualité et la qualité du travail de ce candidat ?"
                : "Comment s'est déroulée votre mission ? Les conditions étaient-elles conformes ?"}
            </p>

            {/* Étoiles */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-[#c2c9bb]"
                    }
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-xs text-[#3b6934] font-medium -mt-3">
                {
                  [
                    "Très insatisfait",
                    "Insatisfait",
                    "Correct",
                    "Satisfait",
                    "Excellent",
                  ][rating - 1]
                }
              </p>
            )}

            {/* Commentaire */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                Commentaire{" "}
                <span className="font-normal normal-case">(optionnel)</span>
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isAuthorReview
                    ? "Ex : Très sérieux, ponctuel, excellent travail..."
                    : "Ex : Mission conforme à la description, auteur fiable..."
                }
                className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18] placeholder:text-[#a8b0a0] resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0 || submitReview.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#154212] text-white font-semibold text-xs tracking-widest uppercase hover:bg-[#2d5a27] shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitReview.isPending ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Check size={15} />
              )}
              Envoyer mon évaluation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
