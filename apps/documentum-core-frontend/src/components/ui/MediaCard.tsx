import { Card, CardContent } from "./card";
import { getMediaUrl } from "@/lib/mediaUtils";
import { ImagePreview } from "./ImagePreview";

interface MediaCardProps {
  title: string;
  updatedText: string;
  imageUrl?: string;
  className?: string;
  isListMode?: boolean;
  onInsert?: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  title,
  updatedText,
  imageUrl,
  className = "",
  isListMode = false,
  onInsert,
}) => {
  return (
    <Card className={`h-full border-none shadow-none p-0 ${className}`}>
      <CardContent className="p-0 flex flex-col justify-start gap-1 h-full overflow-visible">
        {!isListMode && imageUrl && (
          <ImagePreview imageUrl={getMediaUrl(imageUrl)}>
            <img
              src={getMediaUrl(imageUrl)}
              alt={title}
              className="w-full h-[60px] object-cover rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg mb-1"
            />
          </ImagePreview>
        )}
        <div className="flex flex-col text-xs leading-tight">
          <div className="font-bold text-m3syslighton-surface overflow-hidden text-ellipsis whitespace-nowrap">
            {title}
          </div>
          <p className="text-m3-body-small text-m3syslighton-surface-variant overflow-hidden text-ellipsis whitespace-nowrap">
            {updatedText}
          </p>
          {onInsert && (
            <button
              type="button"
              onClick={onInsert}
              className="mt-1 self-start text-[10px] px-2 py-0.5 rounded bg-[#65558f] text-white hover:bg-[#4e3f72] transition-colors"
            >
              Insérer
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
