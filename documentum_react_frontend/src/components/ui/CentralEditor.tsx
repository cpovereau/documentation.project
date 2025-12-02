import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useSpeechToText } from "hooks/useSpeechToText";
import { Button } from "components/ui/button";
import { Card } from "components/ui/card";
import { Checkbox } from "components/ui/checkbox"; // À intégrer dans la barre d'outils plus tard
import PopupSuggestion from "components/ui/PopupSuggestion";
import type { PopupProps } from "types/PopupSuggestion";
import type { Editor } from "@tiptap/react";
import { GripVertical } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuTrigger,
} from "components/ui/navigation-menu";
import { useEditor, EditorContent } from "@tiptap/react";
import useXmlBufferStore from "@/store/xmlBufferStore";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { getAllExtensions } from "@/extensions/allExtensions";
import { FindReplaceDialog } from "components/ui//FindReplaceDialog";
import { EditorHistoryPanel } from "components/ui/EditorHistoryPanel";
import { VerticalDragHandle } from "components/ui/VerticalDragHandle";
import { QuestionEditor } from "./QuestionEditor";
import { ExerciceEditor } from "./ExerciceEditor";
import { useLanguageTool } from "@/hooks/useLanguageTool";
import { useFindReplaceTipTap } from "@/hooks/useFindReplaceTipTap";
import { useRubriqueChangeTracker } from "@/hooks/useRubriqueChangeTracker";
import { useDitaLoader } from "@/hooks/useDitaLoader";
import { useSpeechCommands } from "@/hooks/useSpeechCommands";
import { useEditorShortcuts } from "@/hooks/useEditorShortcuts";
import { useGrammarChecker } from "@/hooks/useGrammarChecker";
import { useEditorHistoryTracker } from "@/hooks/useEditorHistoryTracker";
import { useXmlBufferSync } from "@/hooks/useXmlBufferSync";

// Props du composant
interface CentralEditorProps {
  isPreviewMode: boolean;
  onPreviewToggle: () => void;
  isLeftSidebarExpanded: boolean;
  isRightSidebarExpanded: boolean;
  isRightSidebarFloating: boolean;
  visibleDockEditor: "question" | "exercice" | null;
  setVisibleDockEditor: React.Dispatch<React.SetStateAction<"question" | "exercice" | null>>;
  onToggleQuestionEditor: () => void;
  onToggleExerciceEditor: () => void;
  dockEditorHeight: number;
  onResizeDockEditorHeight: (newHeight: number) => void;
  selectedMapItemId: number | null;
}

// Début du composant CentralEditor
export const CentralEditor: React.FC<CentralEditorProps> = ({
  isPreviewMode,
  onPreviewToggle,
  isLeftSidebarExpanded,
  isRightSidebarExpanded,
  isRightSidebarFloating,
  visibleDockEditor,
  setVisibleDockEditor,
  onToggleQuestionEditor,
  onToggleExerciceEditor,
  dockEditorHeight,
  onResizeDockEditorHeight,
  selectedMapItemId,
}) => {
  console.log("🧩 CentralEditor monté");

  // États pour la gestion de l'éditeur
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [initialContent, setInitialContent] = useState<string>("");
  const inputSourceRef = useRef<string | null>(null);
  const [isXmlView, setIsXmlView] = useState(false);
  const [lastXmlValidation, setLastXmlValidation] = useState<null | {
    ok: boolean;
    msg: string;
  }>(null);
  const [wordCount, setWordCount] = useState(0);

  // Référence pour l'éditeur central
  const MIN_QUESTION_EDITOR_HEIGHT = 200;
  const MIN_EXERCICE_EDITOR_HEIGHT = 300;
  const centralEditorRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fonctions pour redimensionner la barre de séparation horizontale
  const handleResizeStart = (e: React.MouseEvent) => {
    const startY = e.clientY;

    const startHeight = dockEditorHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(150, startHeight - delta);
      onResizeDockEditorHeight(newHeight);
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

  // Debug selectedMapItemId
  useEffect(() => {
    console.log("🧭 selectedMapItemId dans CentralEditor :", selectedMapItemId);
  }, [selectedMapItemId]);

  // 🔁 On récupère le XML initial depuis le buffer pour la rubrique sélectionnée
  const getXml = useXmlBufferStore((state) => state.getXml);
  const xml = selectedMapItemId ? getXml(selectedMapItemId) : null;

  // L’éditeur ne dépend plus du contenu XML
  const editor = useEditor(
    {
      extensions: getAllExtensions(),
      content: "<p></p>", // contenu placeholder, le vrai XML sera injecté par useDitaLoader
      onUpdate({ editor }) {
        checkGrammar(editor.getText());
      },
    },
    [selectedMapItemId], // on recrée seulement quand on change de rubrique
  );

  //
  const { startSync, stopSync } = useXmlBufferSync(editor, selectedMapItemId);

  useEffect(() => {
    if (editor) startSync();
    return () => stopSync();
  }, [editor, selectedMapItemId]);

  // Référence pour le suivi de la source d'entrée (clavier, voix, etc.)
  const { hasChanges, resetInitialContent } = useRubriqueChangeTracker(editor, selectedMapItemId);

  // Chargement initial du XML dans l’éditeur
  // ❌ À commenter le temps de stabiliser la chaîne
  //useEffect(() => {
  //  if (editor && xml) {
  //    console.log("✅ Injection initiale dans l’éditeur :", xml);
  //    resetInitialContent();
  // }
  //}, [editor, xml, resetInitialContent]);

  // ✅ Injection automatique du contenu XML depuis le buffer au changement de rubrique
  const { isLoading } = useDitaLoader({ editor, selectedMapItemId });

  // Fonctions pour copier, coller, couper
  function handleCut(editor: Editor | null) {
    if (!editor) return;
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      "\n",
    );
    navigator.clipboard.writeText(selectedText);
    editor.commands.deleteSelection();
    logAction("Texte coupé", selectedText);
  }

  function handleCopy(editor: Editor | null) {
    if (!editor) return;
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      "\n",
    );
    navigator.clipboard.writeText(selectedText);
    logAction("Texte copié", selectedText);
  }

  function handlePaste(editor: Editor | null) {
    if (!editor) return;
    navigator.clipboard.readText().then((text) => {
      editor.commands.insertContent(text);
      logAction("Texte collé", text);
    });
  }

  // Recherche et remplacement de texte
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const { find, replace, replaceAll } = useFindReplaceTipTap(editor);

  // Gestion de l'historique de l'éditeur
  const { historyLog, isHistoryOpen, setIsHistoryOpen, logAction, clearHistory } =
    useEditorHistoryTracker();

  // Gestion des commandes vocales
  const { handleVoiceCommand } = useSpeechCommands(editor);

  // Etat initial de l'éditeur (bouton "Enregistrer" désactivé)
  useEffect(() => {
    if (editor) {
      resetInitialContent();
    }
  }, [editor]);

  // Fonctions pour enregistrer une rubrique
  const onSaveRubrique = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 800)), {
      loading: "Enregistrement en cours...",
      success: "Rubrique enregistrée avec succès !",
      error: "Échec de l’enregistrement",
    });

    if (editor) {
      const current = editor.getHTML();
      resetInitialContent();
    }
  };

  //Vérification de la grammaire
  const { checkGrammar } = useGrammarChecker(editor);

  // État de la dictée vocale
  const [isDictating, setIsDictating] = useState(false);

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

  // Sortie de la dictée vocale en cas de click
  useEffect(() => {
    if (!editor || !isRecording) return;

    const dom = editor.view.dom;

    const handleManualInteraction = () => {
      stop(); // stop dictation
    };

    dom.addEventListener("mousedown", handleManualInteraction);

    return () => {
      dom.removeEventListener("mousedown", handleManualInteraction);
    };
  }, [editor, isRecording, stop]);

  // Toast en cas de sortie de dictée vocale
  useEffect(() => {
    if (isStopping && isRecording) {
      toast.info("⏳ Arrêt de la dictée en cours…", { duration: 8000 });
    }
  }, [isStopping]);

  // Gestion des raccourcis clavier de l'éditeur
  useEditorShortcuts(editor, selectedMapItemId, isDictating, inputSourceRef);

  // Menu du haut (Edition, Insérer, Outils...)
  const menuItems = [
    {
      label: "Edition",
      items: ["Couper", "Copier", "Coller", "Sélectionner tout"],
    },
    {
      label: "Insérer",
      items: ["Task", "Concept", "Reference"],
    },
    {
      label: "Outils",
      items: ["Check compliance", "Export article"],
    },
    {
      label: "Aide",
      action: () => setIsHelpOpen(true),
    },
  ];

  // Fonction pour rendre les éléments du menu
  const renderMenuItems = () => (
    <NavigationMenuList className="flex items-center gap-2">
      {menuItems.map((menuItem, index) => (
        <NavigationMenuItem key={index}>
          {menuItem.items ? (
            <NavigationMenu>
              <NavigationMenuTrigger className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30 transition">
                {menuItem.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="ring-1 ring-gray-200 focus:outline-none focus:ring-0 border border-gray-200">
                <ul>
                  {menuItem.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <button
                        className="w-full text-left px-4 py-1 bg-white hover:bg-blue-100 focus:bg-blue-100 active:bg-blue-200 text-gray-800 rounded transition-colors duration-150 whitespace-nowrap justify-start"
                        onClick={() => {
                          // Actions menu Édition
                          if (item === "Couper") {
                            handleCut(editor);
                          } else if (item === "Copier") {
                            handleCopy(editor);
                          } else if (item === "Coller") {
                            handlePaste(editor);
                          } else if (item === "Sélectionner tout") {
                            editor?.commands.selectAll();
                          }
                          // Actions menu Insérer
                          else if (item === "Task") {
                            editor?.chain().focus().insertTask().run();
                          } else if (item === "Concept") {
                            editor?.chain().focus().insertConcept().run();
                          } else if (item === "Reference") {
                            editor?.chain().focus().insertReference().run();
                          }
                          // ...à compléter pour d'autres menus si besoin
                        }}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenu>
          ) : (
            <Button
              onClick={menuItem.action}
              className="ml-2 bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-xl shadow hover:bg-blue-100 transition"
            >
              {menuItem.label}
            </Button>
          )}
        </NavigationMenuItem>
      ))}
    </NavigationMenuList>
  );

  // Fonction pour valider le XML
  function validateBufferXml() {
    if (!selectedMapItemId) return;

    const xmlString = getXml(selectedMapItemId);
    if (!xmlString || typeof xmlString !== "string" || xmlString.trim() === "") {
      toast.error("Aucun contenu XML à valider.");
      return;
    }

    let valid = false;
    let msg = "";
    try {
      const parser = new window.DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");

      const parserErrors = xmlDoc.getElementsByTagName("parsererror");
      if (parserErrors && parserErrors.length > 0) {
        valid = false;
        msg = "❌ XML non valide : " + parserErrors[0].textContent;
      } else {
        valid = true;
        msg = "✅ XML bien formé !";
      }
    } catch (e) {
      valid = false;
      msg = "❌ Erreur lors de la validation XML : " + (e as Error).message;
    }

    setIsXmlView(true);
    setLastXmlValidation({ ok: valid, msg });
    setTimeout(() => alert(msg), 100);
  }

  // Fonction pour revenir à l'édition après validation XML
  function returnToEdit() {
    setIsXmlView(false);
  }

  // Compteur de mots
  useEffect(() => {
    const dom = editor?.view.dom;
    if (!dom) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains("grammar-error")) {
        const message = target.getAttribute("data-message") || "";
        const suggestions = (target.getAttribute("data-suggestions") || "").split(",");

        const from = editor.view.posAtDOM(target, 0);
        const textContent = target.textContent ?? "";
        const to = from + textContent.length;

        setPopup({
          x: event.clientX,
          y: event.clientY,
          suggestions,
          message,
          from,
          to,
          onReplace: (text, from, to) => {
            editor.commands.insertContentAt({ from, to }, text);
            setPopup(null);
          },
        });
      } else {
        setPopup(null);
      }
    };

    dom.addEventListener("click", handleClick);
    return () => dom.removeEventListener("click", handleClick);
  }, [editor]);

  const [popup, setPopup] = useState<null | PopupProps>(null);

  return (
    <Card
      ref={centralEditorRef}
      style={{ height: "100%" }}
      className="flex flex-col h-full w-full min-h-0 border border-[#e1e1e2] shadow-shadow-md rounded-xl overflow-hidden"
    >
      <header className="flex items-center justify-between px-6 py-3 bg-[#fcfcfc] border-b border-[#e1e1e2]">
        <NavigationMenu>{renderMenuItems()}</NavigationMenu>
        <div className="flex items-center gap-2">
          {isXmlView ? (
            <button
              className="h-11 px-4 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 bg-[#f59e42] hover:bg-[#f97316] text-white font-semibold"
              onClick={returnToEdit}
            >
              Retour à la saisie
            </button>
          ) : (
            <button
              className="h-11 px-4 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold"
              onClick={validateBufferXml}
            >
              Valider XML
            </button>
          )}
          <Button
            className={`h-11 px-4 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 ${
              isPreviewMode ? "bg-[#eb4924] hover:bg-[#d13d1d]" : "bg-[#2463eb] hover:bg-[#1d4ed8]"
            }`}
            onClick={onPreviewToggle}
          >
            {isPreviewMode ? "Cancel Preview" : "Preview"}
          </Button>
          <Button
            className="h-11 px-4 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 bg-[#2463eb] hover:bg-[#1d4ed8]"
            onClick={() =>
              setVisibleDockEditor((prev) => (prev === "question" ? null : "question"))
            }
            disabled={visibleDockEditor === "exercice"}
          >
            Q\R
          </Button>

          <Button
            className="h-11 px-4 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 bg-[#2463eb] hover:bg-[#1d4ed8]"
            onClick={() =>
              setVisibleDockEditor((prev) => (prev === "exercice" ? null : "exercice"))
            }
            disabled={visibleDockEditor === "question"}
          >
            Exercices
          </Button>

          <Button
            className={`h-11 px-5 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 ${
              hasChanges ? "bg-[#15803d] hover:bg-[#166534]" : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={() => {
              toast.success("Rubrique enregistrée !");
              resetInitialContent();
            }}
            disabled={!hasChanges}
          >
            Enregistrer
          </Button>
        </div>
      </header>
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b bg-[#fcfcfc]">
        <button
          onClick={() => editor?.chain().focus().undo().run()}
          title="Annuler"
          className="icon-btn"
        >
          ↺
        </button>
        <button
          onClick={() => editor?.chain().focus().redo().run()}
          title="Rétablir"
          className="icon-btn"
        >
          ↻
        </button>
        <div className="h-5 border-l border-gray-300 mx-2"></div>
        <button
          onClick={() => {
            editor?.chain().focus().toggleBold().run();
            logAction("Texte mis en gras");
          }}
          title="Gras"
          className={`icon-btn ${editor?.isActive("bold") ? "bg-blue-100" : ""}`}
        >
          B
        </button>
        <button
          onClick={() => {
            editor?.chain().focus().toggleItalic().run();
            logAction("Texte mis en italique");
          }}
          title="Italique"
          className={`icon-btn ${editor?.isActive("italic") ? "bg-blue-100" : ""}`}
        >
          I
        </button>
        <button
          onClick={() => {
            editor?.chain().focus().toggleItalic().run();
            logAction("Texte souligné");
          }}
          title="Souligné"
          className={`icon-btn ${editor?.isActive("underline") ? "bg-blue-100" : ""}`}
        >
          U
        </button>
        <div className="h-5 border-l border-gray-300 mx-2"></div>
        <button
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          title="Aligner à gauche"
          className={`icon-btn ${editor?.isActive({ textAlign: "left" }) ? "bg-blue-100" : ""}`}
        >
          ⯇
        </button>
        <button
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          title="Centrer"
          className={`icon-btn ${editor?.isActive({ textAlign: "center" }) ? "bg-blue-100" : ""}`}
        >
          ≡
        </button>
        <button
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          title="Aligner à droite"
          className={`icon-btn ${editor?.isActive({ textAlign: "right" }) ? "bg-blue-100" : ""}`}
        >
          ⯈
        </button>
        <button
          onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
          title="Justifier"
          className={`icon-btn ${editor?.isActive({ textAlign: "justify" }) ? "bg-blue-100" : ""}`}
        >
          ☰
        </button>
        <div className="h-5 border-l border-gray-300 mx-2"></div>
        <input
          type="color"
          onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
          value={editor?.getAttributes("textStyle").color || "#000000"}
          title="Changer la couleur"
          className="ml-2"
        />
        <div className="h-5 border-l border-gray-300 mx-2"></div>
        <button
          onClick={() => {
            const url = prompt("Entrez l'URL :");
            if (url) editor?.chain().focus().setLink({ href: url }).run();
          }}
          className={`icon-btn ${editor?.isActive("link") ? "bg-blue-100" : ""}`}
        >
          🔗
        </button>
        <button
          onClick={() => editor?.chain().focus().unsetLink().run()}
          className="icon-btn"
          title="Supprimer le lien"
        >
          ❌
        </button>

        {/* Séparateur */}
        <div className="border-l h-6 mx-2 border-gray-300" />

        <Button
          onClick={isRecording ? stop : start}
          className={`ml-2 border-l px-3 py-1 font-semibold rounded-xl transition duration-200
    ${
      isRecording
        ? "bg-red-600 hover:bg-red-700 text-white border border-red-700"
        : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-700"
    }
  `}
        >
          🎙️ {isRecording ? "Arrêter" : "Dicter"}
        </Button>

        <button
          className="ml-2 px-3 py-1 rounded bg-gray-100 hover:bg-blue-100 text-gray-700"
          onClick={() => setIsFindOpen(true)}
        >
          🔍 Rechercher / Remplacer
        </button>
        <button
          className="ml-2 px-3 py-1 rounded bg-gray-100 hover:bg-blue-100 text-gray-700"
          onClick={() => setIsHistoryOpen(true)}
        >
          🕑 Historique
        </button>

        <div className="relative">
          <select
            className="border rounded px-2 py-1"
            value={
              editor?.isActive("heading", { level: 1 })
                ? "heading1"
                : editor?.isActive("heading", { level: 2 })
                  ? "heading2"
                  : editor?.isActive("heading", { level: 3 })
                    ? "heading3"
                    : editor?.isActive("note", { type: "important" })
                      ? "important"
                      : editor?.isActive("note", { type: "note" })
                        ? "note"
                        : editor?.isActive("note", { type: "warning" })
                          ? "warning"
                          : "paragraph"
            }
            onChange={(e) => {
              const value = e.target.value;

              if (value === "paragraph") {
                if (
                  editor?.isActive("note", { type: "important" }) ||
                  editor?.isActive("note", { type: "note" }) ||
                  editor?.isActive("note", { type: "warning" })
                ) {
                  const text = editor?.state.doc.textBetween(
                    editor?.state.selection.from,
                    editor?.state.selection.to,
                    " ",
                  );
                  editor
                    ?.chain()
                    .focus()
                    .deleteSelection()
                    .setParagraph()
                    .insertContent(text)
                    .run();
                } else {
                  editor?.chain().focus().setParagraph().run();
                }
              }

              if (value === "heading1") editor?.chain().focus().toggleHeading({ level: 1 }).run();
              if (value === "heading2") editor?.chain().focus().toggleHeading({ level: 2 }).run();
              if (value === "heading3") editor?.chain().focus().toggleHeading({ level: 3 }).run();

              if (["important", "note", "warning"].includes(value)) {
                editor
                  ?.chain()
                  .focus()
                  .insertContent({
                    type: "note",
                    attrs: { type: value },
                    content: [
                      {
                        type: "paragraph",
                        content: [
                          {
                            type: "text",
                            text: `Texte ${value}...`,
                          },
                        ],
                      },
                    ],
                  })
                  .run();
              }
            }}
          >
            <option value="paragraph">Paragraphe</option>
            <option value="heading1">Titre 1</option>
            <option value="heading2">Titre 2</option>
            <option value="heading3">Titre 3</option>
            <option value="important">Important</option>
            <option value="note">Note</option>
            <option value="warning">Warning</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col flex-grow min-h-0 overflow-hidden">
        <div className="h-full overflow-auto p-4 bg-white relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="text-sm text-gray-600 animate-pulse">
                Chargement de la rubrique...
              </span>
            </div>
          )}
          {isXmlView ? (
            <pre className="bg-gray-100 rounded p-4 font-mono text-xs whitespace-pre-wrap">
              {editor?.getHTML()}
            </pre>
          ) : (
            <EditorContent
              editor={editor}
              className="no-border-editor"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
            />
          )}
          {popup && !isXmlView && (
            <PopupSuggestion
              {...popup}
              onReplace={(text, from, to) => {
                editor?.commands.insertContentAt({ from, to }, text);
                setPopup(null);
              }}
            />
          )}
        </div>
        <footer className="flex h-10 items-center justify-between px-4 py-0 bg-[#fcfcfc] border-t border-[#e1e1e2]">
          <div className="font-text-base-font-medium text-[#1a1a1ab2] text-center whitespace-nowrap">
            {wordCount} mot{wordCount > 1 ? "s" : ""}
          </div>
          <GripVertical className="w-6 h-6" aria-label="Handler" />
        </footer>
        {visibleDockEditor && (
          <>
            <VerticalDragHandle onResizeStart={handleResizeStart} />
            <div className="flex flex-col flex-grow min-h-0 overflow-hidden">
              {visibleDockEditor === "question" && (
                <QuestionEditor
                  height={dockEditorHeight}
                  onResizeDockEditorHeight={onResizeDockEditorHeight}
                  isLeftSidebarExpanded={isLeftSidebarExpanded}
                  isRightSidebarExpanded={isRightSidebarExpanded}
                  isRightSidebarFloating={isRightSidebarFloating}
                  isPreviewMode={isPreviewMode}
                  onClose={onToggleQuestionEditor}
                />
              )}
              {visibleDockEditor === "exercice" && (
                <ExerciceEditor
                  height={dockEditorHeight}
                  onResizeDockEditorHeight={onResizeDockEditorHeight}
                  isLeftSidebarExpanded={isLeftSidebarExpanded}
                  isRightSidebarExpanded={isRightSidebarExpanded}
                  isRightSidebarFloating={isRightSidebarFloating}
                  isPreviewMode={isPreviewMode}
                  onClose={onToggleExerciceEditor}
                />
              )}
            </div>
          </>
        )}
      </div>
      {/* <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Online Help</DialogTitle>
            <DialogDescription>
              This is the online help content. You can add more detailed information here.
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button className="mt-4">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog> */}
      {isFindOpen && (
        <FindReplaceDialog
          findValue={findValue}
          replaceValue={replaceValue}
          onChangeFind={setFindValue}
          onChangeReplace={setReplaceValue}
          onFind={() => find(findValue)}
          onReplace={() => replace(findValue, replaceValue)}
          onReplaceAll={() => replaceAll(findValue, replaceValue)}
          onClose={() => setIsFindOpen(false)}
        />
      )}
      <EditorHistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={historyLog}
        onClear={clearHistory}
      />
    </Card>
  );
};
