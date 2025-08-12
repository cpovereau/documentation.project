// =====================================================
// 📂 Fichier : importmodal.tsx
// 🔎 Description : Modale d'import commune à tous les imports de l'application
//                  Utilisable pour d'autres imports (images, xml...)
// 🗣️ Tous les commentaires doivent être écrits en français.
// =====================================================

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from "@/components/ui/dialog";
import { generateNextMediaName } from "@/lib/mediaUtils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Portal } from "@radix-ui/react-portal";
import Papa from "papaparse";
import { toast } from "sonner";

type ImportContext = "fonctionnalites" | "media" | "xml";

interface ImportModalProps {
  open: boolean;
  title?: string;
  context: ImportContext;
  onClose: () => void;
  onConfirm: (params: any) => void;
  produits?: { id: number; nom: string }[];
  fonctionnalites?: {
    id: number;
    produit: number;
    code: string;
    nom: string;
  }[];
  interfaces?: { id: number; code: string; nom: string }[];
}

export const ImportModal = ({
  open,
  title,
  context = "fonctionnalites",
  onClose,
  onConfirm,
  produits = [],
  fonctionnalites = [],
  interfaces = [],
}: ImportModalProps) => {
  // Réinitialisation à l'ouverture
  useEffect(() => {
    if (open) {
      setStep("file");
      setFile(null);
      setRawData([]);
      setProduitId(null);
      setIgnoreHeader(true);
    }
  }, [open]);

  // Position et drag
  const [position, setPosition] = useState(() => ({
    x: window.innerWidth / 2 - 400,
    y: window.innerHeight / 2 - 250,
  }));
  const offset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  // État pour le fichier, données brutes et mapping
  const [step, setStep] = useState<"file" | "mapping">("file");
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<string[][]>([]);
  const [colMap, setColMap] = useState<Record<string, number>>({
    nom: 0,
    id_fonctionnalite: 1,
    code: 2,
  });

  // Produit sélectionné et option pour ignorer l'en-tête
  const [produitId, setProduitId] = useState<number | null>(null);

  // Option pour ignorer la première ligne (en-tête)
  const [ignoreHeader, setIgnoreHeader] = useState(true);

  // Parsing CSV
  const parseCSV = (f: File) => {
    Papa.parse(f, {
      delimiter: ";",
      complete: (res) => setRawData(res.data as string[][]),
      error: (err) => console.error("❌ Erreur PapaParse :", err),
      skipEmptyLines: true,
    });
  };

  // État pour la fonctionnalité et l'interface utilisateur
  const [fonctionnaliteId, setFonctionnaliteId] = useState<number | null>(null);
  const [interfaceId, setInterfaceId] = useState<number | null>(null);
  const [nomMedia, setNomMedia] = useState<string>(""); // nom proposé (PLA-MEN-EDT-005.jpg)
  const [fileExtension, setFileExtension] = useState<string>("jpg"); // ou png, gif...
  const [doublon, setDoublon] = useState<boolean>(false);

  // Nommage des Médias
  useEffect(() => {
    const fetchMediaNames = async () => {
      // Vérifie qu'on a bien tout
      if (!produitId || !fonctionnaliteId || !interfaceId) {
        setNomMedia("");
        return;
      }

      try {
        const res = await fetch(
          `/medias/check-nom/?produit=${produitId}&fonctionnalite=${fonctionnaliteId}&interface=${interfaceId}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("Erreur API check-nom");

        const data = await res.json();
        const { prefix, existing_names } = data;

        const generated = generateNextMediaName(existing_names, fileExtension);
        setNomMedia(generated);
        setDoublon(existing_names.includes(generated));
      } catch (err) {
        console.error(
          "❌ Erreur lors de la vérification du nom du média :",
          err
        );
        setNomMedia("ERREUR_GENERATION_NOM");
      }
    };

    fetchMediaNames();
  }, [produitId, fonctionnaliteId, interfaceId, fileExtension]);

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

  const handleConfirm = () => {
    // --- Cas : import de fonctionnalités (CSV)
    if (context === "fonctionnalites" || context === "xml") {
      if (!file || rawData.length === 0) {
        toast.error("Aucun fichier sélectionné ou fichier vide.");
        return;
      }

      if (!produitId) {
        toast.error("Veuillez sélectionner un produit avant de valider.");
        return;
      }

      onConfirm({
        file,
        mapping: colMap,
        produitId,
        skipHeader: ignoreHeader,
      });
      return;
    }

    // --- Cas : import de média (image ou vidéo)
    if (context === "media") {
      if (
        !file ||
        !produitId ||
        !fonctionnaliteId ||
        !interfaceId ||
        !nomMedia
      ) {
        toast.error("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      onConfirm({
        file,
        produitId,
        fonctionnaliteId,
        interfaceId,
        nomAuto: nomMedia,
        remplacer: doublon,
      });
      return;
    }

    // --- Cas non géré
    toast.error("Type d'import inconnu ou non implémenté.");
  };

  // Drag de la fenêtre
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
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <Portal>
        {/* Overlay visuel mais qui ne bloque pas la modale */}
        <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-none" />

        <DialogContent
          position={position} // ✅ coupe le centrage Radix
          className="z-[1000] pointer-events-auto"
          aria-describedby="import-dialog-description"
        >
          <DialogDescription className="sr-only">
            Fenêtre d'importation de fichier CSV avec options de mappage.
          </DialogDescription>

          <div onMouseDown={handleMouseDown} className="cursor-move mb-4">
            <DialogTitle>{title}</DialogTitle>
          </div>

          {/* 📁 CONTEXT : Import CSV (fonctionnalités / xml) */}
          {(context === "fonctionnalites" || context === "xml") && (
            <>
              {/* Étape 1 : choix du fichier CSV */}
              {step === "file" && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border border-dashed p-6 rounded text-center bg-gray-50"
                >
                  <p className="mb-2 text-gray-700">
                    Glissez un fichier .csv ici
                  </p>
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

              {/* Étape 2 : mapping CSV */}
              {step === "mapping" && rawData.length > 0 && (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <Checkbox
                      checked={ignoreHeader}
                      onChange={(e) => setIgnoreHeader(e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">
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
                            setColMap({
                              ...colMap,
                              [key]: parseInt(e.target.value),
                            })
                          }
                        >
                          {rawData[0].map((_, idx) => (
                            <option key={idx} value={idx.toString()}>
                              Colonne {idx + 1} ({rawData[0][idx]?.slice(0, 15)}
                              )
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
            </>
          )}

          {/* 📁 CONTEXT : Import Médias (Images) */}
          {context === "media" && (
            <>
              {/* Sélection produit */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produit
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

              {/* Sélection fonctionnalité */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fonctionnalité
                </label>
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={fonctionnaliteId?.toString() || ""}
                  onChange={(e) =>
                    setFonctionnaliteId(parseInt(e.target.value))
                  }
                >
                  <option value="">Sélectionner une fonctionnalité</option>
                  {fonctionnalites
                    .filter((f) => f.produit === produitId)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nom} ({f.code})
                      </option>
                    ))}
                </select>
              </div>

              {/* Sélection interface */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interface utilisateur
                </label>
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={interfaceId?.toString() || ""}
                  onChange={(e) => setInterfaceId(parseInt(e.target.value))}
                >
                  <option value="">Sélectionner une interface</option>
                  {interfaces.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nom} ({i.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload image */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fichier image
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setFile(f);
                    if (f) {
                      const ext =
                        f.name.split(".").pop()?.toLowerCase() || "jpg";
                      setFileExtension(ext);
                    }
                  }}
                />
              </div>

              {/* Aperçu du nom calculé */}
              {nomMedia && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Nom proposé :</strong> {nomMedia}
                </p>
              )}

              {/* Détection d’un doublon */}
              {doublon && (
                <p className="text-red-600 text-sm mb-2">
                  ⚠️ Ce fichier existe déjà. Vous pouvez le remplacer.
                </p>
              )}

              <div className="flex justify-end gap-4 mt-4">
                <Button variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button onClick={handleConfirm}>Valider l’import</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Portal>
    </Dialog>
  );
};
