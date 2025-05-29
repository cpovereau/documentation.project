import { Card, CardContent } from "components/ui/card";

export const MediaCard: React.FC<MediaCardProps & { className?: string }> = ({
  title,
  updatedText,
  imageUrl,
  className = "",
}) => {
  return (
    <Card className={`border-none shadow-none p-0 ${className}`}>
      <CardContent className={`p-0 flex flex-col gap-1 ${className ?? ""}`}>
        <div
          className="w-full h-[220px] rounded-2xl bg-cover bg-center cursor-pointer transition-all duration-300 hover:shadow-lg"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="flex flex-col">
          <h3 className="font-m3-title-small text-m3syslighton-surface overflow-hidden text-ellipsis whitespace-nowrap">
            {title}
          </h3>
          <p className="font-m3-body-small text-m3syslighton-surface-variant overflow-hidden text-ellipsis whitespace-nowrap">
            {updatedText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
