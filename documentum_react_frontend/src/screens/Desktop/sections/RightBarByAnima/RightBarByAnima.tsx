import React from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { ScrollArea, ScrollBar } from "../../../../components/ui/scroll-area";
import { Separator } from "../../../../components/ui/separator";

export const RightBarByAnima = (): JSX.Element => {
  // Media card data for mapping
  const mediaCards = [
    {
      id: 1,
      title: "Title",
      updatedText: "Updated today",
      imageUrl: "https://c.animaapp.com/macke9kyh9ZtZh/img/image-2.png",
    },
    {
      id: 2,
      title: "Title",
      updatedText: "Updated yesterday",
      imageUrl: "https://c.animaapp.com/macke9kyh9ZtZh/img/image-2.png",
    },
    {
      id: 3,
      title: "Title",
      updatedText: "Updated 2 days ago",
      imageUrl: "https://c.animaapp.com/macke9kyh9ZtZh/img/image-2.png",
    },
  ];

  return (
    <div className="w-[248px] h-[938px] flex-shrink-0">
      <div className="relative h-full">
        <div className="ml-[5px] h-full bg-[#f7a900] rounded-[15px]">
          {/* Top control buttons */}
          <div className="flex justify-between items-center p-6">
            <Button variant="ghost" className="p-0 h-12 w-12">
              <img
                className="w-12 h-12"
                alt="Rightbar collapse"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rightbar-collapse.svg"
              />
            </Button>
            <Button variant="ghost" className="p-0 h-[38px] w-[38px]">
              <img
                className="w-[38px] h-[38px]"
                alt="Right bar detach"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rightbardetach.svg"
              />
            </Button>
          </div>

          <div className="px-3">
            {/* Header with title */}
            <div className="relative flex items-center mb-4">
              <Button variant="ghost" className="p-0 h-12 w-12">
                <img
                  className="w-12 h-12"
                  alt="Media collapse"
                  src="https://c.animaapp.com/macke9kyh9ZtZh/img/mapcollapsebutton.svg"
                />
              </Button>
              <h2 className="font-['Roboto',Helvetica] font-extrabold text-black text-[32px]">
                Médias
              </h2>
              <Separator className="absolute top-0.5 left-3 w-[221px]" />
            </div>

            {/* Toggle between Images and Video */}
            <div className="flex justify-center items-center my-6">
              <div className="relative flex items-end justify-center gap-3 w-[175px]">
                <img
                  className="w-8 h-8"
                  alt="Images"
                  src="https://c.animaapp.com/macke9kyh9ZtZh/img/images.svg"
                />
                <img
                  className="relative w-10 h-6"
                  alt="Switch"
                  src="https://c.animaapp.com/macke9kyh9ZtZh/img/switch.svg"
                />
                <img
                  className="w-8 h-8"
                  alt="Video"
                  src="https://c.animaapp.com/macke9kyh9ZtZh/img/video.svg"
                />
              </div>
            </div>

            {/* SearchIcon input */}
            <div className="relative mb-4">
              <div className="flex items-center border-[3px] border-solid border-[#65558f] rounded-[10px] p-1">
                <Button variant="ghost" className="p-2 h-12 w-12">
                  <img
                    className="w-6 h-6"
                    alt="SearchIcon icon"
                    src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-3.svg"
                  />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    className="border-none focus-visible:ring-0 h-12 font-m3-body-large text-m3syslighton-surface"
                    placeholder="Input"
                  />
                  <span className="inline-flex items-center px-1 py-0 absolute -top-3 -left-9 bg-[#f7a900] text-m-3syslightprimary font-m3-body-small">
                    Recherche
                  </span>
                </div>
                <Button variant="ghost" className="p-2 h-12 w-12">
                  <img
                    className="w-6 h-6"
                    alt="Clear icon"
                    src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-7.svg"
                  />
                </Button>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex justify-between mb-4">
              <Button
                variant="ghost"
                className="flex items-center gap-2 pl-3 pr-4 py-2.5 h-10 rounded-[100px]"
              >
                <img
                  className="w-[18px] h-[18px]"
                  alt="Filter icon"
                  src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-9.svg"
                />
                <span className="font-m3-label-large text-m-3syslightprimary">
                  Label
                </span>
              </Button>

              <Button variant="ghost" className="p-2 h-10 rounded-[100px]">
                <img
                  className="w-6 h-6"
                  alt="More options"
                  src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-5.svg"
                />
              </Button>
            </div>

            {/* Media cards in scrollable area */}
            <ScrollArea className="h-[599px] bg-white rounded-[15px] shadow-[inset_0px_4px_4px_#00000040]">
              <div className="p-6 space-y-5">
                {mediaCards.map((card) => (
                  <Card key={card.id} className="border-none shadow-none">
                    <CardContent className="p-0 flex flex-col w-[121px] gap-1">
                      <div
                        className="w-full h-[120px] rounded-2xl bg-cover bg-center"
                        style={{ backgroundImage: `url(${card.imageUrl})` }}
                      />
                      <div className="flex flex-col">
                        <h3 className="h-5 font-m3-title-small text-m3syslighton-surface truncate">
                          {card.title}
                        </h3>
                        <p className="h-4 font-m3-body-small text-m3syslighton-surface-variant truncate">
                          {card.updatedText}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
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
        </div>
      </div>
    </div>
  );
};
