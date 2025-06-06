import React from "react";
// Update the import path below if your Button component is located elsewhere
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { ScrollArea } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";

interface SyncRightSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const SyncRightSidebar: React.FC<SyncRightSidebarProps> = ({ isExpanded, onToggle }) => {
  return (
    <>
      <div className={`bg-[#f7a900] h-full transition-all duration-300 ease-in-out ${isExpanded ? 'w-[248px]' : 'w-0'} overflow-hidden`}>
        <div className="pt-20 px-4 flex flex-col h-full">
          <div className="space-y-4 mb-6">
            <h2 className="text-2xl font-bold">Détail du sujet</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Dernière mise à jour</label>
              <Input value="15/04/2023" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Auteur</label>
              <Input value="Jean Dupont" readOnly />
            </div>
            <Button className="w-full">Ouvrir pour modification</Button>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Médias</h2>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input placeholder="Recherche" className="pl-8" />
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-100 p-2 rounded">
                      <div className="bg-gray-300 w-full h-20 mb-2"></div>
                      <p className="text-xs">Image {i}</p>
                      <p className="text-xs text-gray-500">15/04/2023</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <Button className="w-full">Importer une image</Button>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        className={`fixed top-[123px] p-0 h-12 w-12 z-50 transition-all duration-300 ease-in-out`}
        style={{ 
          right: isExpanded ? '248px' : '0',
          transform: 'translateX(50%)'
        }}
        onClick={onToggle}
      >
        <ChevronRight aria-label="Rightbar toggle" />
      </Button>
    </>
  );
};
