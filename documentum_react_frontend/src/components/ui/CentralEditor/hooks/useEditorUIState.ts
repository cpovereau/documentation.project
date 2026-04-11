import { useState } from "react";

export type UseEditorUIStateApi = {
  ui: {
    wordCount: number;
    setWordCount: React.Dispatch<React.SetStateAction<number>>;
    isDragging: boolean;
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  };
  handleResizeStartWrapper: (
    onResize: (newHeight: number) => void,
    dockEditorHeight: number,
  ) => (e: React.MouseEvent) => void;
};

/**
 * États UI locaux de l'éditeur central :
 * - wordCount : compteur de mots (à brancher sur onUpdate de l'éditeur)
 * - isDragging : état de glissement du séparateur de dock
 * - handleResizeStartWrapper : logique de resize du dock éditeur secondaire
 *
 * Note : popup et lastXmlValidation ont été sortis vers leurs hooks dédiés
 * (useGrammarPopup et useEditorDialogs respectivement).
 */
const useEditorUIState = (): UseEditorUIStateApi => {
  const [wordCount, setWordCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleResizeStartWrapper =
    (onResize: (newHeight: number) => void, dockEditorHeight: number) =>
    (e: React.MouseEvent) => {
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
      isDragging,
      setIsDragging,
    },
    handleResizeStartWrapper,
  };
};

export default useEditorUIState;
