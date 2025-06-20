// CentralEditor.tsx
// Éditeur central principal de l'application Desktop

import React, { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useSpeechToText } from "hooks/useSpeechToText";
import { Button } from "components/ui/button";
import { Card } from "components/ui/card"; // CardContent non utilisé
import { Checkbox } from "components/ui/checkbox"; // À intégrer dans la barre d'outils plus tard
import { GripVertical } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuTrigger,
} from "components/ui/navigation-menu";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Task from "extensions/Task";
import Concept from "extensions/Concept";
import Reference from "extensions/Reference";
import Important from "extensions/Important";
import Note from "extensions/Note";
import Warning from "extensions/Warning";
import { QuestionEditor } from "./QuestionEditor";

// Fonctions d'édition classiques (copier/coller/trouver/remplacer...)
//... (ces fonctions sont inchangées et nécessaires)

// Props du composant
interface CentralEditorProps {
  isPreviewMode: boolean;
  onPreviewToggle: () => void;
  isLeftSidebarExpanded: boolean;
  isRightSidebarExpanded: boolean;
  isRightSidebarFloating: boolean;
}

// Début du composant CentralEditor
export const CentralEditor: React.FC<CentralEditorProps> = ({
  isPreviewMode,
  onPreviewToggle,
  isLeftSidebarExpanded,
  isRightSidebarExpanded,
  isRightSidebarFloating,
}) => {
  // États
  const [isQuestionEditorVisible, setIsQuestionEditorVisible] = useState(false);
  const [questionEditorHeight, setQuestionEditorHeight] = useState(200);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const [historyLog, setHistoryLog] = useState<
    { action: string; ts: number; content?: string }[]
  >([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isXmlView, setIsXmlView] = useState(false);
  const [lastXmlValidation, setLastXmlValidation] = useState<null | {
    ok: boolean;
    msg: string;
  }>(null);
  const [wordCount, setWordCount] = useState(0);
  const inputSourceRef = useRef<string | null>(null);

  // Références
  const centralEditorRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const initialHeight = useRef<number>(200);
  const dragOffset = useRef<number>(0);

  // Fonctions pour copier, coller, couper
  function handleCut(editor: Editor | null) {
    if (!editor) return;
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      "\n"
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
      "\n"
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

  // Historique local des actions
  function logAction(action: string, content?: string) {
    setHistoryLog((logs) => [...logs, { action, ts: Date.now(), content }]);
  }

  // Initialisation de l'éditeur TipTap avec extensions personnalisées
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        inputRules: false,
      }),
      Underline,
      TextStyle,
      Color,
      Link,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Task,
      Concept,
      Reference,
      Important,
      Note,
      Warning,
    ],
    content: "<p>Commence à écrire…</p>",
  });

  // Gestion des commandes vocales

  const [isDictating, setIsDictating] = useState(false);

  const { start, stop, isRecording, isStopping, error } = useSpeechToText({
    onResult: (text) => {
      if (!editor) return;

      inputSourceRef.current = "voice";

      const { state, view } = editor;

      const pos = state.selection.$from.pos;
      const needsSpace =
        pos > 0 && !/\s$/.test(state.doc.textBetween(pos - 1, pos));

      const tr = state.tr.insertText((needsSpace ? " " : "") + text, pos);
      view.dispatch(tr);

      setTimeout(() => {
        inputSourceRef.current = null;
      }, 100);
    },

    onCommand: (cmd) => {
      if (!editor) return;

      editor.chain().focus().run();

      const { state, commands } = editor;
      const { from } = state.selection;

      switch (cmd) {
        case "deletePreviousWord":
          if (!state.selection.empty) {
            commands.deleteSelection().run();
            return;
          }

          if (from <= 1) return;

          const textBefore = editor.getText().slice(0, from);
          const match = textBefore.match(/(\S+)\s*$/);

          if (match) {
            const start = from - match[0].length;
            commands
              .setTextSelection({ from: start, to: from })
              .deleteSelection()
              .run();
          } else {
            commands.deleteBackward().run();
          }
          return;

        case "start":
          commands.setTextSelection({ from: 1 }).run();
          return;

        case "end":
          const end = state.doc.content.size || 1;
          commands.setTextSelection({ from: end }).run();
          return;

        case "newline":
          commands.insertContent("\n\n").run();
          return;

        case "selectAll":
          commands.selectAll().run();
          return;

        case "selectParagraph": {
          const { doc, selection } = state;
          const pos = selection.$from.pos;

          let start = pos;
          let end = pos;

          // Cherche le bloc parent (paragraph ou heading)
          doc.descendants((node, posStart, parent) => {
            if (
              node.type.name === "paragraph" ||
              node.type.name === "heading"
            ) {
              if (pos >= posStart && pos <= posStart + node.nodeSize) {
                start = posStart + 1;
                end = posStart + node.nodeSize - 1;
                return false; // stop walking
              }
            }
            return true;
          });

          commands.setTextSelection({ from: start, to: end }).run();
          return;
        }
        case "undo":
          commands.undo().run();
          return;

        case "redo":
          commands.redo().run();
          return;

        case "bold":
          commands.toggleBold().run();
          return;

        case "italic":
          commands.toggleItalic().run();
          return;

        case "underline":
          commands.toggleUnderline().run();
          return;

        case "cut":
          handleCut(editor);
          return;

        case "copy":
          handleCopy(editor);
          return;

        case "paste":
          handlePaste(editor);
          return;

        case "save":
          alert("💾 Sauvegarde simulée !");
          return;

        default:
          console.warn("Commande vocale inconnue :", cmd);
      }
    },
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

  // Effet pour compteur de mots + comportements automatiques (majuscule, virgule)
  useEffect(() => {
    if (!editor || isDictating) {
      console.log("Keydown désactivé (isDictating = true)");
      return;
    }

    const updateWordCount = () => {
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length === 1 && words[0] === "" ? 0 : words.length);
    };

    updateWordCount();
    editor.on("update", updateWordCount);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (inputSourceRef.current === "voice") return;

      const { state, view } = editor;
      const { selection } = state;
      const pos = selection.$from.pos;
      const docText = editor.getText();
      const preceding = docText.slice(Math.max(0, pos - 3), pos);

      if (preceding.endsWith(". ") && /^[a-z]$/.test(event.key)) {
        event.preventDefault();
        const uppercase = event.key.toUpperCase();
        view.dispatch(state.tr.insertText(uppercase, pos));
      }

      if (event.key === "," && docText[pos] !== " ") {
        event.preventDefault();
        view.dispatch(state.tr.insertText(", ", pos));
      }
    };

    const dom = editor.view.dom;
    dom.addEventListener("keydown", handleKeyDown);

    return () => {
      editor.off("update", updateWordCount);
      dom.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, isDictating]);

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

  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    initialHeight.current = questionEditorHeight;
    const handleRect = (e.target as HTMLElement).getBoundingClientRect();
    dragOffset.current = e.clientY - handleRect.top;
    // Ajoute la classe pour empêcher la sélection pendant le drag
    document.body.classList.add("select-none");
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && centralEditorRef.current) {
        const editorRect = centralEditorRef.current.getBoundingClientRect();
        // Y du curseur par rapport au top du CentralEditor
        const relativeY = e.clientY - editorRect.top;
        // Calcul de la hauteur du QUestionEditor : tout ce qui est sous le curseur
        const newHeight = Math.max(
          50,
          Math.min(editorRect.height - relativeY, editorRect.height - 200)
        );
        setQuestionEditorHeight(newHeight);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartY.current = null;
    // Retire la classe à la fin du drag
    document.body.classList.remove("select-none");
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  function validateXML() {
    const xmlString = `<racine>${editor?.getHTML()}</racine>`;
    let valid = false;
    let msg = "";
    try {
      const parser = new window.DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");
      const parserError = xmlDoc.getElementsByTagName("parsererror");
      if (parserError.length > 0) {
        valid = false;
        msg = "❌ XML non valide : " + parserError[0].textContent;
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

  function returnToEdit() {
    setIsXmlView(false);
  }

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <Card
      ref={centralEditorRef}
      className="flex flex-col w-full h-full border border-[#e1e1e2] shadow-shadow-md rounded-xl overflow-hidden"
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
              onClick={validateXML}
            >
              Valider XML
            </button>
          )}
          <Button
            className={`h-11 px-4 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 ${
              isPreviewMode
                ? "bg-[#eb4924] hover:bg-[#d13d1d]"
                : "bg-[#2463eb] hover:bg-[#1d4ed8]"
            }`}
            onClick={onPreviewToggle}
          >
            {isPreviewMode ? "Cancel Preview" : "Preview"}
          </Button>
          <Button
            className="h-11 px-4 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 bg-[#2463eb] hover:bg-[#1d4ed8]"
            onClick={() => setIsQuestionEditorVisible(!isQuestionEditorVisible)}
          >
            Q\R
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
        <div className="h-5 border-l mx-2"></div>
        <button
          onClick={() => {
            editor?.chain().focus().toggleBold().run();
            logAction("Texte mis en gras");
          }}
          title="Gras"
          className={`icon-btn ${
            editor?.isActive("bold") ? "bg-blue-100" : ""
          }`}
        >
          B
        </button>
        <button
          onClick={() => {
            editor?.chain().focus().toggleItalic().run();
            logAction("Texte mis en italique");
          }}
          title="Italique"
          className={`icon-btn ${
            editor?.isActive("italic") ? "bg-blue-100" : ""
          }`}
        >
          I
        </button>
        <button
          onClick={() => {
            editor?.chain().focus().toggleItalic().run();
            logAction("Texte souligné");
          }}
          title="Souligné"
          className={`icon-btn ${
            editor?.isActive("underline") ? "bg-blue-100" : ""
          }`}
        >
          U
        </button>
        <div className="h-5 border-l mx-2"></div>
        <button
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          title="Aligner à gauche"
          className={`icon-btn ${
            editor?.isActive({ textAlign: "left" }) ? "bg-blue-100" : ""
          }`}
        >
          ⯇
        </button>
        <button
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          title="Centrer"
          className={`icon-btn ${
            editor?.isActive({ textAlign: "center" }) ? "bg-blue-100" : ""
          }`}
        >
          ≡
        </button>
        <button
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          title="Aligner à droite"
          className={`icon-btn ${
            editor?.isActive({ textAlign: "right" }) ? "bg-blue-100" : ""
          }`}
        >
          ⯈
        </button>
        <button
          onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
          title="Justifier"
          className={`icon-btn ${
            editor?.isActive({ textAlign: "justify" }) ? "bg-blue-100" : ""
          }`}
        >
          ☰
        </button>
        <div className="h-5 border-l mx-2"></div>
        <input
          type="color"
          onChange={(e) =>
            editor?.chain().focus().setColor(e.target.value).run()
          }
          value={editor?.getAttributes("textStyle").color || "#000000"}
          title="Changer la couleur"
          className="ml-2"
        />
        <div className="h-5 border-l mx-2"></div>
        <button
          onClick={() => {
            const url = prompt("Entrez l'URL :");
            if (url) editor?.chain().focus().setLink({ href: url }).run();
          }}
          className={`icon-btn ${
            editor?.isActive("link") ? "bg-blue-100" : ""
          }`}
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

        <Button
          onClick={isRecording ? stop : start}
          className={`ml-2 px-3 py-1 font-semibold rounded-xl transition duration-200
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
                : editor?.isActive("important")
                ? "important"
                : editor?.isActive("note")
                ? "note"
                : editor?.isActive("warning")
                ? "warning"
                : "paragraph"
            }
            onChange={(e) => {
              const value = e.target.value;
              // Transformation en place pour titre et paragraphe
              if (value === "paragraph")
                editor?.chain().focus().setParagraph().run();
              if (value === "heading1")
                editor?.chain().focus().toggleHeading({ level: 1 }).run();
              if (value === "heading2")
                editor?.chain().focus().toggleHeading({ level: 2 }).run();
              if (value === "heading3")
                editor?.chain().focus().toggleHeading({ level: 3 }).run();
              // Insertion de bloc Important, Note, Warning
              if (value === "important") {
                editor
                  ?.chain()
                  .focus()
                  .insertContent({
                    type: "important",
                    content: [
                      {
                        type: "paragraph",
                        content: [{ type: "text", text: "Texte important..." }],
                      },
                    ],
                  })
                  .run();
              }
              if (value === "note") {
                editor
                  ?.chain()
                  .focus()
                  .insertContent({
                    type: "note",
                    content: [
                      {
                        type: "paragraph",
                        content: [{ type: "text", text: "Texte de note..." }],
                      },
                    ],
                  })
                  .run();
              }
              if (value === "warning") {
                editor
                  ?.chain()
                  .focus()
                  .insertContent({
                    type: "warning",
                    content: [
                      {
                        type: "paragraph",
                        content: [
                          { type: "text", text: "Texte de warning..." },
                        ],
                      },
                    ],
                  })
                  .run();
              }
              if (value === "paragraph") {
                if (
                  editor?.isActive("important") ||
                  editor?.isActive("note") ||
                  editor?.isActive("warning")
                ) {
                  // Remplace le node courant par un paragraphe contenant son texte
                  const text = editor?.state.doc.textBetween(
                    editor?.state.selection.from,
                    editor?.state.selection.to,
                    " "
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

      <div className="flex flex-col flex-grow overflow-hidden">
        <div className="flex-grow overflow-auto p-4 bg-white">
          {isXmlView ? (
            <pre className="bg-gray-100 rounded p-4 font-mono text-xs whitespace-pre-wrap">
              {editor?.getHTML()}
            </pre>
          ) : (
            <EditorContent
              editor={editor}
              className="no-border-editor"
              spellCheck={true}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
            />
          )}
        </div>

        {isQuestionEditorVisible && (
          <>
            <div
              className="h-[12px] bg-gray-200 cursor-ns-resize flex items-center justify-center"
              onMouseDown={handleMouseDown}
            >
              <div className="w-16 h-1 bg-gray-400 rounded-full"></div>
            </div>
            <QuestionEditor
              height={questionEditorHeight}
              isLeftSidebarExpanded={isLeftSidebarExpanded}
              isRightSidebarExpanded={isRightSidebarExpanded}
              isRightSidebarFloating={isRightSidebarFloating}
              isPreviewMode={isPreviewMode}
            />
          </>
        )}
      </div>

      <footer className="flex h-10 items-center justify-between px-4 py-0 bg-[#fcfcfc] border-t border-[#e1e1e2]">
        <div className="font-text-base-font-medium text-[#1a1a1ab2] text-center whitespace-nowrap">
          {wordCount} mot{wordCount > 1 ? "s" : ""}
        </div>
        <GripVertical className="w-6 h-6" aria-label="Handler" />
      </footer>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[600px] max-w-[96vw] animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                🔍 Rechercher / Remplacer
              </h3>
              <input
                className="border border-gray-200 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-base"
                placeholder="Rechercher…"
                value={findValue}
                autoFocus
                onChange={(e) => setFindValue(e.target.value)}
              />
              <input
                className="border border-gray-200 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-base"
                placeholder="Remplacer par…"
                value={replaceValue}
                onChange={(e) => setReplaceValue(e.target.value)}
              />
              <div className="flex flex-row gap-3 mt-2 flex-wrap justify-end">
                <button
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                  onClick={() => handleFind(editor, findValue)}
                >
                  Suivant
                </button>
                <button
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                  onClick={() => handleReplace(editor, findValue, replaceValue)}
                >
                  Remplacer
                </button>
                <button
                  className="px-4 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold transition"
                  onClick={() =>
                    handleReplaceAll(editor, findValue, replaceValue)
                  }
                >
                  Remplacer tout
                </button>
                <button
                  className="px-4 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
                  onClick={() => setIsFindOpen(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[430px] max-w-[96vw] animate-in fade-in slide-in-from-top-4">
            <h3 className="font-semibold mb-3">Historique des actions</h3>
            <div className="max-h-[400px] overflow-y-auto flex flex-col gap-2">
              {historyLog.length === 0 ? (
                <div className="text-gray-500">Aucune action enregistrée.</div>
              ) : (
                historyLog
                  .slice()
                  .reverse()
                  .map((item, i) => (
                    <div key={i} className="flex flex-col text-sm">
                      <span className="font-medium text-gray-800">
                        {new Date(item.ts).toLocaleTimeString()} — {item.action}
                      </span>
                      {item.content && (
                        <span className="text-gray-500 line-clamp-1">
                          {item.content}
                        </span>
                      )}
                    </div>
                  ))
              )}
            </div>
            <button
              className="mt-4 px-4 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setIsHistoryOpen(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};
