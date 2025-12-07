import { useState } from "react";
import type { PopupProps } from "types/PopupSuggestion";

export type UseEditorUIStateApi = {
  ui: {
    wordCount: number;
    setWordCount: React.Dispatch<React.SetStateAction<number>>;
    lastXmlValidation: { ok: boolean; msg: string } | null;
    setLastXmlValidation: React.Dispatch<React.SetStateAction<{ ok: boolean; msg: string } | null>>;
    popup: PopupProps | null;
    setPopup: React.Dispatch<React.SetStateAction<PopupProps | null>>;
    isDragging: boolean;
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  },
  handleResizeStartWrapper: (onResize: (newHeight: number) => void, dockEditorHeight: number) => (e: React.MouseEvent) => void;
};

const useEditorUIState = (): UseEditorUIStateApi => {
  const [wordCount, setWordCount] = useState(0);
  const [lastXmlValidation, setLastXmlValidation] = useState<null | { ok: boolean; msg: string }>(null);
  const [popup, setPopup] = useState<PopupProps | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // On encapsule seulement le déclenchement initial; la logique du calcul height reste côté CentralEditor
  const handleResizeStartWrapper = (onResize: (newHeight: number) => void, dockEditorHeight: number) => (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = dockEditorHeight;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(150, startHeight - delta);
      onResize(newHeight);
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.userSelect = "";
      setIsDragging(false);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.userSelect = "none";
    setIsDragging(true);
  };

  return {
    ui: {
      wordCount,
      setWordCount,
      lastXmlValidation,
      setLastXmlValidation,
      popup,
      setPopup,
      isDragging,
      setIsDragging,
    },
    handleResizeStartWrapper,
  };
};

export default useEditorUIState;
