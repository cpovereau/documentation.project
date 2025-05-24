import React from "react";
import { Card, CardContent } from "components/ui/card";

interface MediaCardProps {
  title: string;
  updatedText: string;
  imageUrl: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({ title, updatedText, imageUrl }) => {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0 flex flex-col w-[121px] gap-1">
        <div
          className="w-full h-[120px] rounded-2xl bg-cover bg-center cursor-pointer transition-all duration-300 hover:shadow-lg"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="flex flex-col">
          <h3 className="h-5 font-m3-title-small text-m3syslighton-surface truncate">
            {title}
          </h3>
          <p className="h-4 font-m3-body-small text-m3syslighton-surface-variant truncate">
            {updatedText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
