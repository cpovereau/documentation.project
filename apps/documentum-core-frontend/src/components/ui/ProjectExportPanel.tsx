import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText,
  Globe,
  GraduationCap,
  FileDown,
  Settings2,
} from "lucide-react";

const EXPORT_OPTIONS = [
  { value: "PDF", label: "PDF", icon: <FileText className="w-4 h-4 mr-2" /> },
  { value: "Web", label: "Web Help", icon: <Globe className="w-4 h-4 mr-2" /> },
  {
    value: "Moodle",
    label: "Moodle",
    icon: <GraduationCap className="w-4 h-4 mr-2" />,
  },
  {
    value: "Fiche",
    label: "Fiche Pratique",
    icon: <FileDown className="w-4 h-4 mr-2" />,
  },
  {
    value: "Personnalise",
    label: "Export personnalisé (XSLT)",
    icon: <Settings2 className="w-4 h-4 mr-2" />,
  },
];

interface ProjectExportPanelProps {
  readonly projectId: number;
}

export default function ProjectExportPanel({
  projectId,
}: ProjectExportPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>("");

  const handleExport = async () => {
    try {
      console.log(`Export du projet ${projectId} au format ${selectedFormat}`);
      toast.success(`Export lancé au format ${selectedFormat}`);

      // TODO: branchement vers POST /api/export/ avec projectId + selectedFormat
    } catch (error) {
      console.error("Error during export:", error);
      toast.error("Erreur lors de la publication");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publier le projet</CardTitle>
        <CardDescription>
          Choisissez le format de sortie et lancez la publication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedFormat} onValueChange={setSelectedFormat}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un format de sortie" />
          </SelectTrigger>
          <SelectContent>
            {EXPORT_OPTIONS.map(({ value, label, icon }) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center">
                  {icon}
                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleExport} disabled={!selectedFormat}>
          Publier
        </Button>
      </CardContent>
    </Card>
  );
}
