import React from "react";
import { X as XIcon, Upload } from "lucide-react";

export interface ImportModalProps {
  open: boolean;
  title: string;
  accept?: string; // ex : "image/*", ".xlsx", etc.
  onClose: () => void;
  onNext: (file: File | null) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  open,
  title,
  accept = "*",
  onClose,
  onNext,
}) => {
  const [file, setFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [position, setPosition] = React.useState({
    x: window.innerWidth / 2 - 240,
    y: window.innerHeight / 2 - 200,
  }); // centré par défaut
  const dragging = React.useRef(false);
  const offset = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPosition({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    };
    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center"
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative"
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          margin: 0,
          zIndex: 10001,
          cursor: dragging.current ? "move" : "default",
        }}
      >
        {/* Close (croix en haut à droite) */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Fermer"
        >
          <XIcon className="w-6 h-6" />
        </button>
        {/* Titre */}
        <h2
          className="text-2xl font-bold text-gray-800 mb-4 cursor-move select-none"
          onMouseDown={(e) => {
            dragging.current = true;
            offset.current = {
              x: e.clientX - position.x,
              y: e.clientY - position.y,
            };
            document.body.style.userSelect = "none";
          }}
          onMouseUp={() => {
            dragging.current = false;
            document.body.style.userSelect = "";
          }}
        >
          {title}
        </h2>

        {/* Zone Drag & Drop */}
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-[#65558f] rounded-xl bg-gray-50 py-8 px-4 cursor-pointer hover:bg-[#f7a90022] transition"
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length > 0)
              setFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="w-12 h-12 text-[#65558f] mb-2" />
          <span className="font-medium text-gray-700 mb-1">
            Glissez-déposez votre fichier ici
          </span>
          <span className="text-sm text-gray-500 mb-3">ou</span>
          <button
            className="bg-[#65558f] hover:bg-[#f7a900] text-white px-4 py-2 rounded-full font-semibold transition"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Parcourir…
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
          {file && (
            <div className="mt-4 text-green-700 font-medium">
              Fichier sélectionné : {file.name}
            </div>
          )}
        </div>
        {/* Boutons en bas */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium"
            onClick={onClose}
            type="button"
          >
            Annuler
          </button>
          <button
            className={`bg-[#65558f] hover:bg-[#f7a900] text-white px-6 py-2 rounded-lg font-semibold transition ${
              !file ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!file}
            onClick={() => onNext(file)}
            type="button"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};
