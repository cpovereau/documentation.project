import React from "react";
import { Button } from "components/ui/button";
import { ScrollArea, ScrollBar } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";

export type ProjectItem = {
  id: number;
  title: string;
  gamme: string;
  active?: boolean; // Optionnel, car on va gérer la sélection via l’id
};

export interface ProjectModuleProps {
  isExpanded: boolean;
  onToggle: () => void;
  sidebarExpanded: boolean;
  projects: ProjectItem[];
  selectedProjectId: number | null;
  onSelect: (projectId: number) => void;
  onAdd: () => void;
  onLoad: () => void;
  onClone: (projectId: number) => void;
  onDelete: (projectId: number) => void;
  onPublish: (projectId: number) => void;
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
}) => {
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
        <div className="absolute w-[134px] h-[26px] top-[11px] left-[47px] font-['Roboto',Helvetica] font-extrabold text-black text-[32px] tracking-[0] leading-normal whitespace-nowrap">
          Projet
        </div>
        <Button
          variant="ghost"
          className="absolute w-16 h-16 top-0 left-0 p-0"
          onClick={onToggle}
        >
          <img
            className={`w-full h-full transition-transform duration-300 ${
              isExpanded ? "" : "rotate-90"
            }`}
            alt="Projet collapse"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/mapcollapsebutton.svg"
          />
        </Button>
      </div>

      {isExpanded && (
        <>
          <div className="flex items-center justify-between mt-2 mb-2 bg-[#d9d9d94c] rounded-[15px] p-2 mx-[5px]">
            <button className="w-8 h-8" onClick={onAdd}>
              <img
                className="w-full h-full"
                alt="Projet create"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/projetcreate.png"
              />
            </button>
            <button className="w-8 h-8" onClick={onLoad}>
              <img
                className="w-full h-full"
                alt="Projet load"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueload.svg"
              />
            </button>
            {/* Les actions suivantes nécessitent l’ID du projet sélectionné */}
            <button
              className="w-8 h-8"
              onClick={() => selectedProjectId && onClone(selectedProjectId)}
              disabled={!selectedProjectId}
              title="Cloner le projet sélectionné"
            >
              <img
                className="w-full h-full"
                alt="Projet clone"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueclone.svg"
              />
            </button>
            <button
              className="w-8 h-8"
              onClick={() => selectedProjectId && onDelete(selectedProjectId)}
              disabled={!selectedProjectId}
              title="Supprimer le projet sélectionné"
            >
              <img
                className="w-full h-full"
                alt="Projet delete"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriquedelete.svg"
              />
            </button>
            <button
              className="w-8 h-8"
              onClick={() => selectedProjectId && onPublish(selectedProjectId)}
              disabled={!selectedProjectId}
              title="Publier le projet sélectionné"
            >
              <img
                className="w-full h-full"
                alt="Projet publish"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/projetpublish.svg"
              />
            </button>
          </div>
          <div style={{ maxHeight: "180px", overflowY: "auto" }}>
            <ScrollArea className="h-full w-full">
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
                      {project.title}{" "}
                      <span className="italic">({project.gamme})</span>
                    </div>
                    {selectedProjectId === project.id && (
                      <img
                        className="absolute w-6 h-6 top-0 right-0"
                        alt="Projet actif"
                        src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueactive.svg"
                      />
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
        </>
      )}
    </div>
  );
};
