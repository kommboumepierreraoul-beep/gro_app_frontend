/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useRef } from "react";
import { X, ZoomOut, ZoomIn, RotateCcw, Check } from "lucide-react";
import { useCropCanvas } from "./useCropCanvas";
import type { CropState } from "./types";

interface ImageEditorProps {
  src: string;
  onConfirm: (blobUrl: string) => void;
  onCancel: () => void;
}

export function ImageEditor({ src, onConfirm, onCancel }: ImageEditorProps) {
  const [cropState, setCropState] = useState<CropState>({
    scale: 1,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);

  const canvasRef = useCropCanvas(src, cropState);

  const rotate = () =>
    setCropState((s: any) => ({
      ...s,
      rotation: (s.rotation + 90) % 360,
      offsetX: 0,
      offsetY: 0,
    }));

  const reset = () =>
    setCropState({ scale: 1, rotation: 0, offsetX: 0, offsetY: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: cropState.offsetX,
      oy: cropState.offsetY,
    };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    setCropState((s: any) => ({
      ...s,
      offsetX: dragStart.current!.ox + (e.clientX - dragStart.current!.x),
      offsetY: dragStart.current!.oy + (e.clientY - dragStart.current!.y),
    }));
  };

  const onMouseUp = () => setIsDragging(false);

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onConfirm(URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "rgba(249,250,242,0.98)",
          border: "1px solid rgba(194,201,187,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(194,201,187,0.35)" }}
        >
          <span
            className="text-sm font-bold"
            style={{
              color: "#154212",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Modifier l'image
          </span>
          <button
            onClick={onCancel}
            className="w-7 h-7 flex items-center justify-center rounded-full"
            style={{ background: "rgba(194,201,187,0.3)", color: "#42493e" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Canvas */}
        <div
          className="relative overflow-hidden flex items-center justify-center"
          style={{
            background: "#1a1a1a",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <canvas
            ref={canvasRef}
            className="block"
            style={{ width: "100%", maxHeight: "320px", objectFit: "contain" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "33.33% 33.33%",
            }}
          />
        </div>

        {/* Contrôles */}
        <div className="px-4 py-3 space-y-3">
          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 shrink-0" style={{ color: "#72796e" }} />
            <input
              type="range"
              min="50"
              max="300"
              value={Math.round(cropState.scale * 100)}
              onChange={(e) =>
                setCropState((s) => ({
                  ...s,
                  scale: Number(e.target.value) / 100,
                }))
              }
              className="flex-1 h-1 rounded-full appearance-none"
              style={{ accentColor: "#3b6934" }}
            />
            <ZoomIn className="w-4 h-4 shrink-0" style={{ color: "#72796e" }} />
            <span
              className="text-xs tabular-nums w-10 text-right"
              style={{ color: "#72796e" }}
            >
              {Math.round(cropState.scale * 100)}%
            </span>
          </div>

          {/* Boutons actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={rotate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(45,90,39,0.08)",
                color: "#2d5a27",
                border: "1px solid rgba(45,90,39,0.2)",
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Rotation 90°
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(194,201,187,0.2)",
                color: "#42493e",
                border: "1px solid rgba(194,201,187,0.4)",
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
            <div className="flex-1" />
            <button
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #3b6934 0%, #154212 100%)",
                color: "#bcf0ae",
              }}
            >
              <Check className="w-3.5 h-3.5" />
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}