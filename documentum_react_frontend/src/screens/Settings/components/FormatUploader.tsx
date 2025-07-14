import React from "react";
import { Button } from "components/ui/button";
import { UploadCloud } from "lucide-react";

interface FormatUploaderProps {
  type: "DTD" | "XSLT";
}

const FormatUploader: React.FC<FormatUploaderProps> = ({ type }) => {
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO : Intégrer appel API pour enregistrer le fichier côté backend
      console.log(`Fichier téléversé (${type}) :`, file.name);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <label htmlFor="upload-format" className="cursor-pointer">
        <input
          type="file"
          id="upload-format"
          accept=".dtd,.xslt,.xml,.xsl"
          className="hidden"
          onChange={handleUpload}
        />
        <Button variant="outline" className="h-10 px-4 flex gap-2 items-center">
          <UploadCloud className="w-4 h-4" />
          <span>Téléverser un fichier {type}</span>
        </Button>
      </label>
    </div>
  );
};

export default FormatUploader;
