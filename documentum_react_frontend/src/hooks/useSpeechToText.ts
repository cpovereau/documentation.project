// src/hooks/useSpeechToText.ts
import { useEffect, useRef, useState } from "react";

interface UseSpeechToTextOptions {
  lang?: string;
  onResult?: (text: string) => void;
  onCommand?: (command: string) => void;
  onDictateStart?: () => void;
  onDictateEnd?: () => void;
}

function parseSpeechCommands(raw: string): string {
  let result = raw
    .replace(/ nouveau paragraphe/gi, '\n\n')
    .replace(/ retour à la ligne/gi, '\n');

  result = result
    .replace(/([.!?,])\1+/g, '$1')
    .replace(/\s+([.!?,])/g, '$1')
    .replace(/([.!?,])(?=\S)/g, '$1 ')
    .replace(/\s{2,}/g, ' ');

  result = result.replace(/([.!?])\s+([a-zàâäéèêëîïôöùûüç])/g, (_, punc, char) =>
    `${punc} ${char.toUpperCase()}`
  );

  result = result.charAt(0).toUpperCase() + result.slice(1);

  return result.trim();
}

export const useSpeechToText = ({
  lang = "fr-FR",
  onResult,
  onCommand,
  onDictateStart,
  onDictateEnd,
}: UseSpeechToTextOptions) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      onDictateStart?.();

      const rawTranscript = event.results[event.results.length - 1][0].transcript.trim();
      const cleaned = rawTranscript.toLowerCase().trim();

      const commandMap: { pattern: RegExp; command: string }[] = [
        { pattern: /\b(supprime|efface|effacer)\b/, command: "deletePreviousWord" },
        { pattern: /\b(début|aller au début|début du document)\b/, command: "start" },
        { pattern: /\b(fin|aller à la fin|fin du document)\b/, command: "end" },
        { pattern: /nouveau[x]? paragraphes?|retour[s]? à la ligne/i, command: "newline" },
        { pattern: /sélectionne(r)? tout|tout sélectionner|sélection complète/i, command: "selectAll" },
        { pattern: /sélectionne(r)? (la )?phrase|sélectionne(r)? (le )?paragraphe/i, command: "selectParagraph" },
        { pattern: /\b(enregistrer|sauvegarder)\b/, command: "save" },
        { pattern: /\b(annuler|annule)\b/, command: "undo" },
        { pattern: /\b(refaire|refait)\b/, command: "redo" },
        { pattern: /(gras|mettre en gras)/i, command: "bold" },
        { pattern: /(italique|mettre en italique)/i, command: "italic" },
        { pattern: /(souligner|souligné)/i, command: "underline" },
        { pattern: /\b(couper|coupe)\b/, command: "cut" },
        { pattern: /\b(copier|copie)\b/, command: "copy" },
        { pattern: /\b(collé(e)?|coller)\b/, command: "paste" },
      ];

      for (const entry of commandMap) {
        if (entry.pattern.test(cleaned)) {
          onCommand?.(entry.command);
          return;
        }
      }

      const fixed = rawTranscript
        .replace(/([!?])(?=\S)/g, '$1 ')
        .replace(/\s{2,}/g, ' ');

      const parsed = parseSpeechCommands(fixed);
      onResult?.(parsed);

      setTimeout(() => {
        onDictateEnd?.();
      }, 1000);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
      setError(event.error);
      setIsRecording(false);
      setIsStopping(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsStopping(false);
    };

    recognitionRef.current = recognition;
  }, [lang, onResult, onCommand]);

  const start = () => {
    setError(null);
    try {
      recognitionRef.current?.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Speech start error:", e);
    }
  };

  const stop = () => {
    if (!recognitionRef.current) return;

    try {
      setIsStopping(true);
      recognitionRef.current.stop();

      setTimeout(() => {
        if (isRecording) {
          recognitionRef.current?.abort();
          setIsRecording(false);
          setIsStopping(false);
        }
      }, 5000); // laisser un peu plus de temps pour les navigateurs
    } catch (e) {
      console.error("Erreur à l’arrêt de la dictée :", e);
      setIsStopping(false);
    }
  };

  return { start, stop, isRecording, isStopping, error };
};
