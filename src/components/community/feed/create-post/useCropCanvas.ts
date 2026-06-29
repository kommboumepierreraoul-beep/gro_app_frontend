import { useRef, useEffect, useCallback } from "react";
import type { CropState } from "./types";

export function useCropCanvas(
  src: string,
  cropState: CropState,
): React.RefObject<HTMLCanvasElement> {
  // ✅ Correction : Utiliser le type non-nullable avec un cast
  const canvasRef = useRef<HTMLCanvasElement>(null!); // Ajout de "null!"

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      const SIZE = 480;
      canvas.width = SIZE;
      canvas.height = SIZE;
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.save();
      ctx.translate(SIZE / 2 + cropState.offsetX, SIZE / 2 + cropState.offsetY);
      ctx.rotate((cropState.rotation * Math.PI) / 180);
      ctx.scale(cropState.scale, cropState.scale);
      const aspect = img.width / img.height;
      const drawW = aspect >= 1 ? SIZE : SIZE * aspect;
      const drawH = aspect >= 1 ? SIZE / aspect : SIZE;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    };
    img.src = src;
  }, [src, cropState]);

  return canvasRef;
}
