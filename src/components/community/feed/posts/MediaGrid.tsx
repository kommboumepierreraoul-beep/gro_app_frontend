// components/community/posts/MediaGrid.tsx
import { useState } from "react";
import { ZoomIn } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { getFullMediaUrl, getMediaType } from "../shared/utils";

interface MediaItem {
  url: string;
  type?: string;
  mime_type?: string;
}

interface MediaGridProps {
  mediaItems: MediaItem[];
  onMediaClick: (index: number) => void;
}

export function MediaGrid({ mediaItems, onMediaClick }: MediaGridProps) {
  const mediaCount = mediaItems.length;
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  let gridClass = "";
  let mediaHeight = "";

  if (mediaCount === 1) {
    gridClass = "grid-cols-1";
    mediaHeight = "max-h-[400px]";
  } else if (mediaCount === 2) {
    gridClass = "grid-cols-2";
    mediaHeight = "h-[250px] md:h-[300px]";
  } else if (mediaCount === 3) {
    gridClass = "grid-cols-2";
    mediaHeight = "h-[200px] md:h-[250px]";
  } else if (mediaCount === 4) {
    gridClass = "grid-cols-2";
    mediaHeight = "h-[200px] md:h-[220px]";
  } else if (mediaCount >= 5) {
    gridClass = "grid-cols-3";
    mediaHeight = "h-[150px] md:h-[180px]";
  }

  const getImageLayout = (index: number) => {
    if (mediaCount === 3 && index === 0) return "col-span-2";
    return "";
  };

  const displayMedia = mediaCount > 6 ? mediaItems.slice(0, 5) : mediaItems;
  const remainingMedia = mediaCount - 5;

  const renderMediaItem = (item: MediaItem, index: number) => {
    const mediaType = getMediaType(item.url, item.mime_type);
    const layout = getImageLayout(index);
    const fullUrl = getFullMediaUrl(item.url);

    if (mediaType === "video") {
      return (
        <div
          key={index}
          className={`relative cursor-pointer overflow-hidden rounded-xl bg-black ${layout} ${mediaHeight}`}
          onClick={() => onMediaClick(index)}
        >
          <VideoPlayer
            src={item.url}
            autoPlay={false}
            className="w-full h-full"
          />
        </div>
      );
    }

    return (
      <div
        key={index}
        className={`relative bg-gray-100 cursor-pointer overflow-hidden rounded-xl group/image ${layout} ${mediaHeight}`}
        onClick={() => onMediaClick(index)}
      >
        {!imageErrors[index] ? (
          <div className="relative w-full h-full">
            <img
              src={fullUrl}
              alt={`Média ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
              onError={() => setImageErrors((p) => ({ ...p, [index]: true }))}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white/80" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-xs text-gray-400">Image non disponible</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pb-3">
      <div className={`grid ${gridClass} gap-2`}>
        {displayMedia.map((item, i) => renderMediaItem(item, i))}

        {remainingMedia > 0 && (
          <div
            className={`relative bg-gray-900/80 cursor-pointer overflow-hidden rounded-xl flex items-center justify-center ${mediaHeight}`}
            onClick={() => onMediaClick(5)}
          >
            <div className="text-center">
              <p className="text-white text-2xl font-bold">+{remainingMedia}</p>
              <p className="text-white/60 text-xs">médias supplémentaires</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
