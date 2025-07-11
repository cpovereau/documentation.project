import { Button } from "@/components/ui/button";

export default function MaintenanceTab() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <h2 className="text-xl font-bold mb-4">
          Outils de maintenance et nettoyage
        </h2>
        {/* Contenu spécifique aux opérations de maintenance */}
      </div>
      <div className="mt-4 flex justify-end">
        <Button className="h-11 px-6 bg-blue-600 text-white">
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
