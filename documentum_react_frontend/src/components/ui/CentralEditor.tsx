import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "components/ui/button";
import { Card, CardContent } from "components/ui/card";
import { Checkbox } from "components/ui/checkbox";
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
import { BottomBar } from "./BottomBar";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../../../../components/ui/dialog";

function handleCopy(editor: any) {
  if (editor && window.getSelection) {
    const html = editor.getHTML();
    // On copie la sélection actuelle, pas tout le contenu
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      // Crée un div temporaire pour copier le HTML de la sélection
      const temp = document.createElement("div");
      temp.appendChild(selection.getRangeAt(0).cloneContents());
      navigator.clipboard.writeText(temp.innerText); // Copie le texte brut
      navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([temp.innerHTML], { type: "text/html" }),
          "text/plain": new Blob([temp.innerText], { type: "text/plain" }),
        }),
      ]);
    } else {
      // Si rien n'est sélectionné, copie tout
      navigator.clipboard.writeText(editor.getText());
    }
  }
}

function handleCut(editor: any) {
  if (editor && window.getSelection) {
    handleCopy(editor);
    // Supprime la sélection après copie
    editor.commands.deleteSelection();
  }
}

function handlePaste(editor: any) {
  if (editor) {
    navigator.clipboard.readText().then((clipText) => {
      editor.commands.insertContent(clipText);
    });
  }
}

function handleFind(editor, findValue) {
  if (!findValue || !editor) return;
  // Recherche "simple" : place le curseur sur la première occurrence suivante
  const docText = editor.getText();
  const selectionStart = editor.state.selection.to;
  const index = docText.indexOf(findValue, selectionStart);
  if (index !== -1) {
    // Sélectionne le texte trouvé
    editor.commands.setTextSelection({
      from: index + 1,
      to: index + findValue.length,
    });
    editor.commands.focus();
  } else {
    alert("Fin du document atteinte ou aucun résultat.");
  }
}

function handleReplace(editor, findValue, replaceValue) {
  if (!findValue || !editor) return;
  // Vérifie si le texte courant est sélectionné et correspond à findValue
  const sel = editor.state.doc.textBetween(
    editor.state.selection.from,
    editor.state.selection.to,
    " "
  );
  if (sel === findValue) {
    editor.commands.insertContent(replaceValue);
  } else {
    // Sinon, va chercher la prochaine occurrence
    handleFind(editor, findValue);
  }
}

function handleReplaceAll(editor, findValue, replaceValue) {
  if (!findValue || !editor) return;
  // Remplace toutes les occurrences dans tout le doc
  const html = editor.getHTML().split(findValue).join(replaceValue);
  editor.commands.setContent(html, false);
  alert("Tous les résultats ont été remplacés !");
}

interface CentralEditorProps {
  isPreviewMode: boolean;
  onPreviewToggle: () => void;
  isLeftSidebarExpanded: boolean;
  isRightSidebarExpanded: boolean;
  isRightSidebarFloating: boolean;
}

export const CentralEditor: React.FC<CentralEditorProps> = ({
  isPreviewMode,
  onPreviewToggle,
  isLeftSidebarExpanded,
  isRightSidebarExpanded,
  isRightSidebarFloating,
}) => {
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(false);
  const [bottomBarHeight, setBottomBarHeight] = useState(200);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const [historyLog, setHistoryLog] = useState<
    { action: string; ts: number; content?: string }[]
  >([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  function logAction(action: string, content?: string) {
    setHistoryLog((logs) => [
      ...logs,
      {
        action,
        ts: Date.now(),
        content,
      },
    ]);
  }
  const editor = useEditor({
    extensions: [
      StarterKit,
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
      // + d'autres extensions plus tard
    ],
    content: "<p>Commence à écrire…</p>",
  });

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

  const checklistItems = [
    {
      checked: true,
      text: "Research about the WYSIWYG editor's best practices",
    },
    {
      checked: false,
      text: "Organize training sessions for working with rich text editor",
    },
    {
      checked: false,
      text: "Strategize the rich text editor component structure",
    },
  ];

  const featureItems = [
    "Responsive design",
    "Rich-text formatting",
    "Real-time editing",
    "WYSIWYG interface",
    "Font styles and sizes",
    "Text color and highlighting",
    "Text alignment",
    "Bullet and numbered lists",
    "Undo/redo functionality",
    "Image insertion and editing",
    "Hyperlink creation",
    "Dark and light mode",
  ];

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
  const dragStartY = useRef<number | null>(null);
  const initialHeight = useRef<number>(200);
  const dragOffset = useRef<number>(0);
  const centralEditorRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    initialHeight.current = bottomBarHeight;
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
        // Calcul de la hauteur de la BottomBar : tout ce qui est sous le curseur
        const newHeight = Math.max(
          50,
          Math.min(editorRect.height - relativeY, editorRect.height - 200)
        );
        setBottomBarHeight(newHeight);
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
            onClick={() => setIsBottomBarVisible(!isBottomBarVisible)}
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
          <EditorContent editor={editor} className="min-h-[200px]" />
        </div>

        {isBottomBarVisible && (
          <>
            <div
              className="h-[12px] bg-gray-200 cursor-ns-resize flex items-center justify-center"
              onMouseDown={handleMouseDown}
            >
              <div className="w-16 h-1 bg-gray-400 rounded-full"></div>
            </div>
            <BottomBar
              height={bottomBarHeight}
              isLeftSidebarExpanded={isLeftSidebarExpanded}
              isRightSidebarExpanded={isRightSidebarExpanded}
              isRightSidebarFloating={isRightSidebarFloating}
            />
          </>
        )}
      </div>

      <footer className="flex h-10 items-center justify-between px-4 py-0 bg-[#fcfcfc] border-t border-[#e1e1e2]">
        <div className="font-text-base-font-medium text-[#1a1a1ab2] text-center whitespace-nowrap">
          0 words
        </div>
        <img
          className="w-6 h-6"
          alt="Handler"
          src="https://c.animaapp.com/macke9kyh9ZtZh/img/handler-.svg"
        />
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
