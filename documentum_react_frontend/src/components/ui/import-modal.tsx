// src/components/ui/import-modal.tsx

import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useImportColumnMapping } from "@/hooks/useImportColumMapping";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Papa from "papaparse";

/**
 * Modale d'importation de fichier CSV avec mappage des colonnes.
 * Utilisable pour d'autres imports (images, xml...) en adaptant l'étape 2.
 */
interface ImportModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (params: {
    file: File;
    mapping: Record<string, number>;
    produitId: number;
    skipHeader: boolean;
  }) => void;
  produits: { id: number; nom: string }[];
}

export const ImportModal = ({
  open,
  title,
  onClose,
  onConfirm,
  produits,
}: ImportModalProps) => {
  // Position dynamique (centrée au chargement)
  const [position, setPosition] = useState(() => ({
    x: window.innerWidth / 2 - 400,
    y: window.innerHeight / 2 - 250,
  }));
  const offset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  // Étapes internes : sélection du fichier → configuration d'import
  const [step, setStep] = useState<"file" | "mapping">("file");
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<string[][]>([]);
  const [colMap, setColMap] = useState<Record<string, number>>({
    nom: 0,
    id_fonctionnalite: 1,
    code: 2,
  });
  const [produitId, setProduitId] = useState<number | null>(null);
  const [ignoreHeader, setIgnoreHeader] = useState(true);

  // Parser CSV via PapaParse
  const parseCSV = (f: File) => {
    Papa.parse(f, {
      complete: (res) => setRawData(res.data as string[][]),
      skipEmptyLines: true,
    });
  };

  // Drag & drop fichier
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile);
      parseCSV(droppedFile);
      setStep("mapping");
    }
  };

  // Confirmation finale : envoi au parent
  const handleConfirm = () => {
    if (file && produitId !== null) {
      onConfirm({ file, mapping: colMap, produitId, skipHeader: ignoreHeader });
    }
  };

  // Déplacement de la modale (click + drag sur l'entête)
  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent position={position}>
        {/* Description cachée requise par Radix pour l'accessibilité */}
        <p className="sr-only" id="import-dialog-description">
          Fenêtre d'importation de fichier CSV avec options de mappage.
        </p>

        <div onMouseDown={handleMouseDown} className="cursor-move mb-4">
          <DialogTitle>{title}</DialogTitle>
        </div>

        {step === "file" && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border border-dashed p-6 rounded text-center bg-gray-50"
          >
            <p className="mb-2 text-gray-700">Glissez un fichier .csv ici</p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  parseCSV(f);
                  setStep("mapping");
                }
              }}
            />
          </div>
        )}

        {step === "mapping" && rawData.length > 0 && (
          <>
            <div className="mb-4">
              <Checkbox
                checked={ignoreHeader}
                onChange={(e) => setIgnoreHeader(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">
                Ignorer la première ligne (en-tête)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Object.entries({
                nom: "Nom",
                id_fonctionnalite: "ID Fonctionnalité",
                code: "Code",
              }).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={colMap[key]?.toString() || ""}
                    onChange={(e) =>
                      setColMap({ ...colMap, [key]: parseInt(e.target.value) })
                    }
                  >
                    {rawData[0].map((_, idx) => (
                      <option key={idx} value={idx.toString()}>
                        Colonne {idx + 1} ({rawData[0][idx]?.slice(0, 15)})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produit concerné
              </label>
              <select
                className="w-full border rounded px-2 py-1 text-sm"
                value={produitId?.toString() || ""}
                onChange={(e) => setProduitId(parseInt(e.target.value))}
              >
                <option value="">Sélectionner un produit</option>
                {produits.map((p) => (
                  <option key={p.id} value={p.id.toString()}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Aperçu du fichier :
              </h4>
              <div className="border rounded max-h-40 overflow-auto text-sm font-mono bg-white">
                <table className="table-auto w-full">
                  <tbody>
                    {rawData.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-1 border-r">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={handleConfirm}>Valider l’import</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
