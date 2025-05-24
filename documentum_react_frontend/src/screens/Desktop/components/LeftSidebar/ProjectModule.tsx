import React from "react";
import { Button } from "components/ui/button";
import { Card, CardContent } from "components/ui/card";
import { ScrollArea } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";

interface ProjectModuleProps {
  isExpanded: boolean;
  onToggle: () => void;
  sidebarExpanded: boolean;
}

export const ProjectModule: React.FC<ProjectModuleProps> = ({ isExpanded, onToggle, sidebarExpanded }) => {
  const projectItems = [
    {
      id: 1,
      title: (
        <>
          Documentation Utilisateur Planning (<i>Gamme Planning</i>)
        </>
      ),
      active: false,
    },
    {
      id: 2,
      title: (
        <>
          <span className="font-extrabold">Documentation Utilisateur </span>(
          <i>Gamme Usager</i>)
        </>
      ),
      active: true,
    },
  ];

  return (
    <div className="relative w-[310px] transition-all duration-300 ease-in-out" style={{ height: isExpanded && sidebarExpanded ? 'auto' : '48px', marginTop: '0px', marginLeft: '2px' }}>
      <div className="relative w-[310px] h-12">
        <div className="absolute top-0.5 left-3 w-[298px]">
          <Separator className="h-px w-full" />
        </div>
        <div className="absolute w-[134px] h-[26px] top-[11px] left-[47px] font-['Roboto',Helvetica] font-extrabold text-black text-[32px] tracking-[0] leading-normal whitespace-nowrap">
          Projet
        </div>
        <Button
          variant="ghost"
          className="absolute w-12 h-12 top-0 left-0 p-0"
          onClick={onToggle}
        >
          <img
            className={`w-full h-full transition-transform duration-300 ${isExpanded ? '' : 'rotate-90'}`}
            alt="Projet collapse"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/mapcollapsebutton.svg"
          />
        </Button>
      </div>

      {isExpanded && (
        <>
          <div className="flex items-center justify-between mt-2 mb-2 bg-[#d9d9d94c] rounded-[15px] p-2 mx-[5px]">
            <button className="w-8 h-8 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none">
              <img
                className="w-full h-full"
                alt="Projet create"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/projetcreate.png"
              />
            </button>
            <button className="w-8 h-8 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none">
              <img
                className="w-full h-full"
                alt="Projet load"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueload.svg"
              />
            </button>
            <button className="w-8 h-8 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none">
              <img
                className="w-full h-full"
                alt="Projet clone"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueclone.svg"
              />
            </button>
            <button className="w-8 h-8 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none">
              <img
                className="w-full h-full"
                alt="Projet delete"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriquedelete.svg"
              />
            </button>
            <button className="w-8 h-8 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none">
              <img
                className="w-full h-full"
                alt="Projet publish"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/projetpublish.svg"
              />
            </button>
          </div>

          <Card className="w-[310px] rounded-[15px] shadow-[inset_0px_4px_4px_#00000040] overflow-hidden mx-auto">
            <CardContent className="p-0 h-[194px]">
              <ScrollArea className="h-full w-full">
                <div className="p-4">
                  {projectItems.map((project) => (
                    <div
                      key={project.id}
                      className="relative w-full h-[25px] mb-4"
                    >
                      <div className="font-['Roboto',Helvetica] font-normal text-black text-xs tracking-[0] leading-normal">
                        {project.title}
                      </div>
                      {project.active && (
                        <img
                          className="absolute w-6 h-6 top-0 right-0"
                          alt="Projet actif"
                          src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueactive.svg"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
