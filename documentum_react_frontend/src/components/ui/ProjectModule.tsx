import React, { useState } from "react";
import type { ProjectDTO } from "@/types/ProjectDTO";
import { PUBLISH_FORMATS } from "@/api/maps";
import { Button } from "components/ui/button";
import { ScrollArea, ScrollBar } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";
import {
  ChevronDown,
  FilePlus,
  Download,
  Copy,
  Trash,
  Upload,
} from "lucide-react";
import { Card, CardContent } from "components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "components/ui/select";

export interface ProjectModuleProps {
  isExpanded: boolean;
  onToggle: () => void;
  sidebarExpanded: boolean;
  projects: ProjectDTO[];
  selectedProjectId: number | null;
  onSelect: (projectId: number) => void;
  onAdd: () => void;
  onLoad: () => void;
  onClone: (projectId: number) => void;
  onDelete: (projectId: number) => void;
  onPublish: (projectId: number) => void;
  onExport: (format: string) => Promise<void>;
  showExportCard: boolean;
  setShowExportCard: (visible: boolean) => void;
}

export const ProjectModule: React.FC<ProjectModuleProps> = ({
  isExpanded,
  onToggle,
  sidebarExpanded,
  projects,
  selectedProjectId,
  onSelect,
  onAdd,
  onLoad,
  onClone,
  onDelete,
  onPublish,
  onExport,
  showExportCard,
  setShowExportCard,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handleExport = async () => {
    if (!selectedFormat || !selectedProjectId) return;
    setIsPublishing(true);
    try {
      await onExport(selectedFormat);
      setShowExportCard(false);
      setSelectedFormat("");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div
      className="relative w-[310px] transition-all duration-300 ease-in-out"
      style={{
        height: isExpanded && sidebarExpanded ? "auto" : "48px",
        marginTop: "0px",
        marginLeft: "2px",
      }}
    >
      <div className="relative w-[310px] h-12">
        <div className="absolute top-0.5 left-3 w-[298px]">
          <Separator className="h-px w-full" />
        </div>
        <Button
          variant="ghost"
          className="absolute w-14 h-14 top-0 left-0 p-0 flex items-center justify-center"
          onClick={onToggle}
          aria-label={isExpanded ? "Réduire" : "Déplier"}
          title={isExpanded ? "Réduire la section" : "Déplier la section"}
        >
          <ChevronDown
            className={`transition-transform duration-200 w-8 h-8 ${
              isExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
        </Button>
        <div className="absolute w-[134px] h-[26px] top-[11px] left-[47px] font-bold text-black text-[32px] leading-normal">
          Projet
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="flex items-center justify-between gap-2 bg-[#d9d9d94c] rounded-[15px] mt-2 mx-[5px] py-1 px-1">
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition hover:bg-blue-100/70 hover:text-blue-700 group"
              onClick={onAdd}
              title="Créer un projet"
            >
              <FilePlus
                className="w-8 h-8 transition group-hover:scale-110 group-hover:text-blue-700"
                strokeWidth={2.5}
              />
            </Button>
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition hover:bg-blue-100/70 hover:text-blue-700 group"
              onClick={onLoad}
              title="Charger un projet existant"
            >
              <Download
                className="w-8 h-8 transition group-hover:scale-110 group-hover:text-blue-700"
                strokeWidth={2.5}
              />
            </Button>
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition hover:bg-blue-100/70 hover:text-blue-700 group"
              onClick={() => selectedProjectId && onClone(selectedProjectId)}
              disabled={!selectedProjectId}
              title="Cloner le projet sélectionné"
            >
              <Copy
                className="w-8 h-8 transition group-hover:scale-110 group-hover:text-blue-700"
                strokeWidth={2.5}
              />
            </Button>
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition hover:bg-blue-100/70 hover:text-blue-700 group"
              onClick={() => selectedProjectId && onDelete(selectedProjectId)}
              disabled={!selectedProjectId}
              title="Supprimer le projet sélectionné"
            >
              <Trash
                className="w-8 h-8 transition group-hover:scale-110 group-hover:text-blue-700"
                strokeWidth={2.5}
              />
            </Button>
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition hover:bg-blue-100/70 hover:text-blue-700 group"
              onClick={() => selectedProjectId && onPublish(selectedProjectId)}
              disabled={!selectedProjectId}
              title="Publier le projet sélectionné"
            >
              <Upload
                className="w-8 h-8 transition group-hover:scale-110 group-hover:text-blue-700"
                strokeWidth={2.5}
              />
            </Button>
          </div>

          <div style={{ maxHeight: "180px", overflowY: "auto" }}>
            <ScrollArea>
              <div>
                {projects.map((project, idx) => (
                  <div
                    key={project.id}
                    className={`relative w-full h-[25px] ${
                      idx !== projects.length - 1 ? "mb-2" : ""
                    } cursor-pointer ${
                      selectedProjectId === project.id
                        ? "bg-blue-100 font-bold"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => onSelect(project.id)}
                  >
                    <div className="font-['Roboto',Helvetica] font-normal text-black text-xs tracking-[0] leading-normal">
                      {project.nom} <span className="italic"></span>
                    </div>
                    {selectedProjectId === project.id && (
                      <div className="absolute w-6 h-6 top-0 right-0" aria-label="Projet actif" />
                    )}
                  </div>
                ))}
              </div>
              <ScrollBar
                orientation="vertical"
                className="w-2.5 bg-[#d9d9d9] rounded-[15px] shadow-[inset_0px_4px_4px_#00000040] blur-[2px]"
              >
                <div className="w-2.5 h-[45px] mt-6 ml-0.5 bg-black rounded-[15px]" />
              </ScrollBar>
            </ScrollArea>
          </div>

          {selectedProjectId && showExportCard && (
            <div className="mt-3 mx-[5px]">
              <Card>
                <CardContent>
                  <div className="font-bold text-sm mb-2">Publier le projet</div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Choisissez le format de sortie et lancez la publication.
                  </div>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un format de sortie">
                        {selectedFormat &&
                          PUBLISH_FORMATS.find((opt) => opt.value === selectedFormat) && (
                            <span>
                              {PUBLISH_FORMATS.find((opt) => opt.value === selectedFormat)?.label}
                            </span>
                          )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PUBLISH_FORMATS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    className="ht-11 mt-3 w-full"
                    onClick={handleExport}
                    disabled={!selectedFormat || isPublishing}
                  >
                    {isPublishing ? "Publication en cours…" : "Publier"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="mt-2 ht-11 w-full text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => setShowExportCard(false)}
                  >
                    Annuler
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};
