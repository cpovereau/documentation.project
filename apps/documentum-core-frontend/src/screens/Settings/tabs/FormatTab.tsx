import React, { useState } from "react";
import FormatSidebar from "../components/FormatSidebar";
import FormatUploader from "../components/FormatUploader";
import FormatFileList from "../components/FormatFileList";
import FormatPreview from "../components/FormatPreview";

export default function FormatTab() {
  const [activeType, setActiveType] = useState<"DTD" | "XSLT">("DTD");
  const [selectedFile, setSelectedFile] = useState<{
    id: number;
    nom: string;
    contenu: string;
  } | null>(null);
  const [fichiers, setFichiers] = useState<
    { id: number; nom: string; contenu: string }[]
  >([
    {
      id: 1,
      nom: "structure_base.dtd",
      contenu: `<!ELEMENT rubrique (titre, contenu)>
<!ATTLIST rubrique id ID #REQUIRED>`,
    },
    {
      id: 2,
      nom: "transformation_default.xslt",
      contenu: `<xsl:stylesheet version="1.0">
  <xsl:template match="/">
    <html><body><h1>Document</h1></body></html>
  </xsl:template>
</xsl:stylesheet>`,
    },
  ]);

  const fichiersFiltres = fichiers.filter((f) =>
    activeType === "DTD" ? f.nom.endsWith(".dtd") : f.nom.endsWith(".xslt")
  );

  const handleDelete = (id: number) => {
    setFichiers((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      if (selectedFile?.id === id) setSelectedFile(null);
      return updated;
    });
  };

  return (
    <div className="flex h-full">
      <FormatSidebar activeType={activeType} onSelect={setActiveType} />
      <div className="flex-1 bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <FormatUploader type={activeType} />
        </div>

        <FormatFileList
          fichiers={fichiersFiltres}
          selectedId={selectedFile ? selectedFile.id : null}
          onSelect={setSelectedFile}
          onDelete={handleDelete}
        />

        {selectedFile && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-gray-700 mb-2">
              Aperçu du fichier :
            </h2>
            <FormatPreview contenu={selectedFile.contenu} />
          </div>
        )}
      </div>
    </div>
  );
}
