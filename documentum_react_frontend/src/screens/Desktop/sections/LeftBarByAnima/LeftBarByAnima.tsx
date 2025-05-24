import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { Separator } from "../../../../components/ui/separator";

export const LeftBarByAnima = (): JSX.Element => {
  // Project data for mapping
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

  // Map data for tree structure
  const mapItems = [
    { id: 1, level: 0, title: "Racine", expanded: true },
    { id: 2, level: 1, title: "Introduction", expanded: false },
    { id: 3, level: 1, title: "Connexion à l'application", expanded: false },
    {
      id: 4,
      level: 1,
      title: "Dossier de l'Usager",
      expanded: true,
      active: true,
    },
    { id: 5, level: 2, title: "Administratif", expanded: true },
    { id: 6, level: 3, title: "Etablissement", expanded: false },
    { id: 7, level: 3, title: "Etat Civil", expanded: false },
  ];

  return (
    <div className="w-[345px] h-[921px] bg-[#f7a900] rounded-[15px] relative">
      {/* Collapse button */}
      <img
        className="absolute w-12 h-12 top-2 right-[13px]"
        alt="Leftbar collapse"
        src="https://c.animaapp.com/macke9kyh9ZtZh/img/leftbar-collapse.svg"
      />

      {/* Project Section */}
      <div className="relative w-[294px] h-[287px] top-[73px] left-0.5">
        <div className="relative w-[292px] h-12">
          <div className="absolute w-[134px] h-[26px] top-[11px] left-[47px] font-['Roboto',Helvetica] font-extrabold text-black text-[32px] tracking-[0] leading-normal whitespace-nowrap">
            Projet
          </div>
          <img
            className="absolute w-12 h-12 top-0 left-0"
            alt="Projet collapse"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/mapcollapsebutton.svg"
          />
          <div className="absolute top-0.5 left-3 w-[280px]">
            <Separator className="h-px w-full" />
          </div>
        </div>

        {/* Project toolbar */}
        <div className="absolute w-[263px] h-9 top-[54px] left-5 bg-[#d9d9d94c] rounded-[15px] flex items-center px-2">
          <img
            className="w-8 h-8"
            alt="Projet create"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/projetcreate.png"
          />
          <Separator orientation="vertical" className="h-[27px] mx-1" />
          <img
            className="w-8 h-8"
            alt="Projet load"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueload.svg"
          />
          <Separator orientation="vertical" className="h-[27px] mx-1" />
          <img
            className="w-8 h-8"
            alt="Projet clone"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueclone.svg"
          />
          <Separator orientation="vertical" className="h-[27px] mx-1" />
          <img
            className="w-8 h-8"
            alt="Projet delete"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriquedelete.svg"
          />
          <Separator orientation="vertical" className="h-[27px] mx-1" />
          <img
            className="w-8 h-8"
            alt="Projet publish"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/projetpublish.svg"
          />
        </div>

        {/* Project list */}
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

      {/* Map Section */}
      <div className="relative w-[294px] h-[505px] top-[378px] left-0">
        <div className="relative w-[292px] h-12">
          <div className="absolute w-[134px] h-[26px] top-[11px] left-[47px] font-['Roboto',Helvetica] font-extrabold text-black text-[32px] tracking-[0] leading-normal whitespace-nowrap">
            Map
          </div>
          <img
            className="absolute w-12 h-12 top-0 left-0"
            alt="Map collapse button"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/mapcollapsebutton.svg"
          />
          <div className="absolute top-0.5 left-3 w-[280px]">
            <Separator className="h-px w-full" />
          </div>
        </div>

        {/* Map toolbar */}
        <div className="absolute w-[263px] h-9 top-[55px] left-[22px] bg-[#d9d9d94c] rounded-[15px] flex items-center px-2">
          <img
            className="w-8 h-8"
            alt="Rubrique create"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriquecreate.png"
          />
          <Separator orientation="vertical" className="h-[27px] mx-1" />
          <div className="relative w-[31px] h-[31px]">
            <img
              className="absolute w-[31px] h-1 top-0 left-0"
              alt="Vector"
              src="https://c.animaapp.com/macke9kyh9ZtZh/img/vector-59.svg"
            />
            <div className="absolute w-2 h-[7px] top-[17px] left-2.5 [-webkit-text-stroke:1px_#2e26c1] font-['SeoulHangang-EB',Helvetica] font-normal text-[#2e26c1] text-[10px] tracking-[0] leading-normal whitespace-nowrap">
              W
            </div>
            <img
              className="absolute w-[25px] h-[31px] top-0 left-[3px]"
              alt="Rectangle"
              src="https://c.animaapp.com/macke9kyh9ZtZh/img/rectangle-4144.svg"
            />
            <img
              className="absolute w-2.5 h-2.5 top-5 left-[18px]"
              alt="Vector"
              src="https://c.animaapp.com/macke9kyh9ZtZh/img/vector-298.svg"
            />
            <img
              className="absolute w-0.5 h-2.5 top-[7px] left-3.5"
              alt="Vector"
              src="https://c.animaapp.com/macke9kyh9ZtZh/img/vector-296.svg"
            />
            <img
              className="absolute w-[11px] h-1.5 top-[5px] left-2.5"
              alt="Vector"
              src="https://c.animaapp.com/macke9kyh9ZtZh/img/vector-297.svg"
            />
          </div>
          <Separator orientation="vertical" className="h-[27px] mx-1" />
          <img
            className="w-8 h-8"
            alt="Rubrique load"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueload.svg"
          />
          <Separator orientation="vertical" className="h-[27px] mx-1" />
          <img
            className="w-8 h-8"
            alt="Rubrique clone"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueclone.svg"
          />
          <Separator orientation="vertical" className="h-[27px] mx-1" />
          <img
            className="w-8 h-8"
            alt="Rubrique delete"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriquedelete.svg"
          />
        </div>

        {/* Map tree view */}
        <Card className="absolute w-[266px] h-[412px] top-[93px] left-[22px] rounded-[15px] shadow-[inset_0px_4px_4px_#00000040] overflow-hidden">
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-full w-full relative">
              <div className="p-4">
                <div className="relative w-[183px]">
                  {mapItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative flex items-center h-[21px]"
                      style={{ paddingLeft: `${item.level * 16}px` }}
                    >
                      {item.expanded && (
                        <img
                          className="w-4 h-4 mr-1"
                          alt="Nbtree collapse"
                          src="https://c.animaapp.com/macke9kyh9ZtZh/img/nbtree-collapse.svg"
                        />
                      )}
                      <div
                        className={`font-['Roboto',Helvetica] ${item.active ? "font-extrabold" : "font-normal"} text-[#515a6e] text-xs tracking-[0] leading-normal whitespace-nowrap`}
                      >
                        {item.title}
                      </div>
                      {item.active && (
                        <img
                          className="absolute w-6 h-6 right-[-30px]"
                          alt="Rubrique active"
                          src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueactive.svg"
                        />
                      )}
                    </div>
                  ))}
                  <div className="absolute left-6 top-4 h-[118px] w-[1px] bg-gray-300" />
                </div>
              </div>
              <div className="absolute h-[412px] w-[19px] top-0 right-0 bg-[#d9d9d9] rounded-[15px] shadow-[inset_0px_4px_4px_#00000040] blur-[2px]">
                <div className="h-[31px] w-[13px] bg-black rounded-[15px] relative top-[17px] left-[3px]" />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
