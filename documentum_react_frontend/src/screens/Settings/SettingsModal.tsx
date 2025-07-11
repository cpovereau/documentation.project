import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import SettingsScreen from "./SettingsScreen";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({
  open,
  onClose,
}: Readonly<SettingsModalProps>) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset]);

  if (!open) return null;

  useEffect(() => {
    if (isDragging) {
      document.body.classList.add("no-select");
    } else {
      document.body.classList.remove("no-select");
    }

    return () => {
      document.body.classList.remove("no-select");
    };
  }, [isDragging]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center p-6">
      <div
        ref={modalRef}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        className="w-full max-w-6xl bg-white rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
      >
        <div
          className="flex items-center justify-between px-6 py-4 bg-black text-white border-t-4 border-l-4 border-r-4 border-orange-400 shadow-[0_4px_6px_rgba(255,115,0,0.4)] rounded-t-xl"
          onMouseDown={(e) => {
            if (modalRef.current) {
              const bounds = modalRef.current.getBoundingClientRect();
              setOffset({
                x: e.clientX - bounds.left - position.x,
                y: e.clientY - bounds.top - position.y,
              });
              setIsDragging(true);
            }
          }}
        >
          <h2 className="text-xl font-semibold">Paramètres</h2>
          <button onClick={onClose} className="hover:text-red-400">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="h-[90vh] overflow-y-auto">
          <SettingsScreen />
        </div>
      </div>
    </div>
  );
}
