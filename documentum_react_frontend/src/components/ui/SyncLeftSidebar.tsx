import React from "react";
import { Button } from "components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";
import { ScrollArea } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";
import { Card, CardContent } from "components/ui/card";
import { Star, ChevronDown, ChevronRight, Plus, ChevronLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "components/ui/tooltip";

interface SyncLeftSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  selectedProduct: string;
  setSelectedProduct: (product: string) => void;
  selectedVersion: string;
  setSelectedVersion: (version: string) => void;
  selectedFeature: number | null;
  setSelectedFeature: (featureId: number | null) => void;
  products: string[];
  versions: string[];
  features: { id: number; name: string; needsUpdate: boolean }[];
}

export const SyncLeftSidebar: React.FC<SyncLeftSidebarProps> = ({
  isExpanded,
  onToggle,
  selectedProduct,
  setSelectedProduct,
  selectedVersion,
  setSelectedVersion,
  selectedFeature,
  setSelectedFeature,
  products,
  versions,
  features
}) => {
  return (
    <>
      <div className={`bg-[#f7a900] h-full transition-all duration-300 ease-in-out ${isExpanded ? 'w-[345px]' : 'w-0'} overflow-hidden`}>
        <div className="pt-20 px-4 flex flex-col h-full">
          <div className="relative w-[292px] h-12 mb-4">
            <h2 className="absolute w-[134px] h-[26px] top-[11px] font-['Roboto',Helvetica] font-extrabold text-black text-[32px] tracking-[0] leading-normal whitespace-nowrap">
              Produit
            </h2>
            <div className="absolute top-0.5 left-3 w-[280px]">
              <Separator className="h-px w-full" />
            </div>
          </div>

          <div className="flex items-center mb-6">
            <div className="flex-grow mr-2">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="h-10">
                  <SelectValue>{selectedProduct}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product} value={product}>{product}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline" className="h-10 w-10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Créer un produit</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="relative w-[292px] h-12 mb-4">
            <h2 className="absolute w-[134px] h-[26px] top-[11px] font-['Roboto',Helvetica] font-extrabold text-black text-[32px] tracking-[0] leading-normal whitespace-nowrap">
              Fonctionnalités
            </h2>
            <div className="absolute top-0.5 left-3 w-[280px]">
              <Separator className="h-px w-full" />
            </div>
          </div>

          <Card className="w-[310px] rounded-[15px] shadow-[inset_0px_4px_4px_#00000040] overflow-hidden mx-auto mb-6">
            <CardContent className="p-0 h-[194px]">
              <ScrollArea className="h-full w-full">
                <div className="p-4">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className="relative w-full h-[25px] mb-4 flex items-center"
                      onClick={() => setSelectedFeature(feature.id)}
                    >
                      {selectedFeature === feature.id ? (
                        <ChevronDown className="w-4 h-4 mr-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2" />
                      )}
                      <div className="font-['Roboto',Helvetica] font-normal text-black text-xs tracking-[0] leading-normal">
                        {feature.name}
                      </div>
                      {feature.needsUpdate && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full ml-2" />
                      )}
                      {selectedFeature === feature.id && (
                        <Star className="absolute w-6 h-6 right-0" aria-label="Feature active" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-2">Version</h2>
          <div className="flex items-center mb-6">
            <div className="flex-grow mr-2">
              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger className="h-10">
                  <SelectValue>{selectedVersion}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version} value={version}>{version}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline" className="h-10 w-10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Créer une version</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button className="mb-2 w-full">
            <Plus className="w-4 h-4 mr-2" /> Ajouter une fonctionnalité
          </Button>

          <div className="mt-[100px]">
            <Button className="mb-2 w-full" variant="outline">
              Publier le suivi de version
            </Button>
            <Button variant="outline" className="w-full">
              Afficher l'arbre d'impact
            </Button>
          </div>
        </div>
      </div>
<Button
  variant="ghost"
  className={`fixed top-[123px] p-0 h-12 w-12 z-50 transition-all duration-300 ease-in-out`}
  style={{ 
    left: isExpanded ? '345px' : '0',
    transform: 'translateX(-50%)'
  }}
  onClick={onToggle}
>
  <ChevronLeft aria-label="Leftbar toggle" />
</Button>
    </>
  );
};
