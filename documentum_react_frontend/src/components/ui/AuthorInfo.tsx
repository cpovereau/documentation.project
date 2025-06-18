import React, { useState } from "react";
import { User, ChevronDown } from "lucide-react";
import { Button } from "components/ui/button";
import { Separator } from "components/ui/separator";

interface AuthorInfoProps {
  auteur: string;
  date: string;
}

export const AuthorInfo: React.FC<AuthorInfoProps> = ({ auteur, date }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="relative w-full">
      <Separator className="h-px w-full" />
      {/* Chevron + Titre */}
      <div className="flex items-start justify-start font-bold text-black text-[32px] leading-normal mb-1 pl-1">
        <Button
          variant="ghost"
          className="w-10 h-10 p-0 mb-3 flex items-center justify-center"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? "Réduire" : "Déplier"}
          title={expanded ? "Réduire la section" : "Déplier la section"}
        >
          <ChevronDown
            className={`transition-transform duration-200 w-8 h-8 ${
              expanded ? "rotate-0" : "-rotate-90"
            }`}
          />
        </Button>
        Attributs
      </div>

      {/* Bloc blanc arrondi */}
      {expanded && (
        <div className="w-full p-4 bg-white rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <User className="w-6 h-6 text-gray-700" />
            <div className="flex flex-col text-sm text-gray-800">
              <span className="font-semibold">Mis à jour par {auteur}</span>
              <span className="text-gray-500 text-xs">le {date}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
