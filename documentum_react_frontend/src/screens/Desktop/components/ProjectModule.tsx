import React from "react";
import { Card, CardContent } from "components/ui/card";
import { ScrollArea } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";

interface ProjectModuleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const ProjectModule: React.FC<ProjectModuleProps> = ({ isExpanded, onToggle }) => {
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

  if (!isExpanded) return null;

  return (
    <div className="relative w-[294px] h-[287px] top-[73px] left-0.5">
      <div className="relative w-[292px] h-12">
        <div className="absolute w-[134px] h-[26px] top-[11px] left-[47px] font-['Roboto',Helvetica] font-extrabold text-black text-[32px] tracking-[0] leading-normal whitespace-nowrap">
          Projet
        </div>
        <img
          className="absolute w-12 h-12 top-0 left-0 cursor-pointer"
          alt="Projet collapse"
          src="https://c.animaapp.com/macke9kyh9ZtZh/img/mapcollapsebutton.svg"
          onClick={onToggle}
        />
        <div className="absolute top-0.5 left-3 w-[280px]">
          <Separator className="h-px w-full" />
        </div>
      </div>

      <div className="absolute w-[263px] h-9 top-[54px] left-5 bg-[#d9d9d94c] rounded-[15px] flex items-center px-2">
        <img
          className="w-8 h-8 cursor-pointer"
          alt="Projet create"
          src="https://c.animaapp.com/macke9kyh9ZtZh/img/projetcreate.png"
        />
        <Separator orientation="vertical" className="h-[27px] mx-1" />
        <img
          className="w-8 h-8 cursor-pointer"
          alt="Projet load"
          src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueload.svg"
        />
        <Separator orientation="vertical" className="h-[27px] mx-1" />
        <img
          className="w-8 h-8 cursor-pointer"
          alt="Projet clone"
          src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueclone.svg"
        />
        <Separator orientation="vertical" className="h-[27px] mx-1" />
        <img
          className="w-8 h-8 cursor-pointer"
          alt="Projet delete"
          src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriquedelete.svg"
        />
        <Separator orientation="vertical" className="h-[27px] mx-1" />
        <img
          className="w-8 h-8 cursor-pointer"
          alt="Projet publish"
          src="https://c.animaapp.com/macke9kyh9ZtZh/img/projetpublish.svg"
        />
      </div>

      <Card className="absolute w-[270px] h-[194px] top-[93px] left-5 rounded-[15px] shadow-[inset_0px_4px_4px_#00000040] overflow-hidden">
        <CardContent className="p-0 h-full">
          <ScrollArea className="h-full w-full relative">
            <div className="p-4">
              {projectItems.map((project) => (
                <div
                  key={project.id}
                  className="relative w-[213px] h-[25px] mb-4"
                >
                  <div className="font-['Roboto',Helvetica] font-normal text-black text-xs tracking-[0] leading-normal">
                    {project.title}
                  </div>
                  {project.active && (
                    <img
                      className="absolute w-6 h-6 top-0 left-[177px]"
                      alt="Projet actif"
                      src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueactive.svg"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="absolute h-[194px] w-[19px] top-0 right-0 bg-[#d9d9d9] rounded-[15px] shadow-[inset_0px_4px_4px_#00000040] blur-[2px]">
              <div className="h-[15px] w-[13px] bg-black rounded-[15px] relative top-2 left-[3px]" />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
