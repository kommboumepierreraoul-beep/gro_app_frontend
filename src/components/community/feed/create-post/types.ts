export interface MediaItem {
  file: File;
  preview: string;
  type: "image" | "video";
  edited?: string;
}

export interface CropState {
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}