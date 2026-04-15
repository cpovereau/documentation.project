import { useRef, useCallback, useEffect, type RefObject } from "react";
import { toast } from "sonner";
import { useSpeechToText } from "hooks/useSpeechToText";
import { useSpeechCommands } from "@/hooks/useSpeechCommands";
import type { Editor } from "@tiptap/react";

export type UseDictationApi = {
  isRecording: boolean;
  isStopping: boolean;
  error: string | null | undefined;
  /** true quand la dictée est active — reflète isRecording */
  isDictating: boolean;
  inputSourceRef: RefObject<"keyboard" | "voice" | null>;
  handleStartDictation: () => void;
  handleStopDictation: () => void;
};

/**
 * Encapsule toute la logique de dictée vocale :
 * - useSpeechToText (insertion de texte dans l'éditeur)
 * - useSpeechCommands (commandes vocales)
 * - Toasts de démarrage / arrêt
 * - Arrêt automatique sur clic dans l'éditeur
 */
export const useDictation = (editor: Editor | null): UseDictationApi => {
  const inputSourceRef = useRef<"keyboard" | "voice" | null>(null);

  const { handleVoiceCommand } = useSpeechCommands(editor);

  const { start, stop, isRecording, isStopping, error } = useSpeechToText({
    onResult: (text) => {
      if (!editor) return;

      inputSourceRef.current = "voice";

      const { state, view } = editor;
      const pos = state.selection.$from.pos;
      const needsSpace = pos > 0 && !/\s$/.test(state.doc.textBetween(pos - 1, pos));

      const tr = state.tr.insertText((needsSpace ? " " : "") + text, pos);
      view.dispatch(tr);

      setTimeout(() => {
        inputSourceRef.current = null;
      }, 100);
    },
    onCommand: handleVoiceCommand,
  });

  // Toast au lancement de la dictée vocale
  useEffect(() => {
    if (isRecording) {
      toast.success("🎙️ Dictée en cours…", {
        duration: 3000,
        id: "dictate-start",
      });
    }
  }, [isRecording]);

  // Arrêt automatique de la dictée vocale sur clic dans l'éditeur
  useEffect(() => {
    if (!editor || !isRecording) return;
    let dom: HTMLElement;
    try {
      dom = editor.view.dom;
    } catch {
      return;
    }
    const handleManualInteraction = () => {
      stop();
    };
    dom.addEventListener("mousedown", handleManualInteraction);
    return () => {
      dom.removeEventListener("mousedown", handleManualInteraction);
    };
  }, [editor, isRecording, stop]);

  // Toast lors de l'arrêt de la dictée vocale
  useEffect(() => {
    if (isStopping && isRecording) {
      toast.info("⏳ Arrêt de la dictée en cours…", { duration: 8000 });
    }
  }, [isStopping]);

  const handleStartDictation = useCallback(() => {
    start();
  }, [start]);

  const handleStopDictation = useCallback(() => {
    stop();
  }, [stop]);

  return {
    isRecording,
    isStopping,
    error,
    isDictating: isRecording,
    inputSourceRef,
    handleStartDictation,
    handleStopDictation,
  };
};
