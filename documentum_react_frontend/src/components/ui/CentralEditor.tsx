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
import { BottomBar } from "./BottomBar";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../../../../components/ui/dialog";

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
  const [activeFormatting, setActiveFormatting] = useState<string[]>([]);
  const [content, setContent] = useState(
    "This is a sample text. Click on the formatting buttons above to see the effect."
  );
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(false);
  const [bottomBarHeight, setBottomBarHeight] = useState(200);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const cardContentRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    {
      label: "Edition",
      items: ["Cut", "Copy", "Paste"],
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

  const toolbarIcons = [
    [
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/undo.svg",
        alt: "Undo",
      },
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/redo.svg",
        alt: "Redo",
      },
    ],
    [
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/print.svg",
        alt: "Print",
      },
    ],
    [
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/bold.svg",
        alt: "Bold",
      },
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/italic.svg",
        alt: "Italic",
      },
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/underline.svg",
        alt: "Underline",
      },
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/strikethrough.svg",
        alt: "Strikethrough",
      },
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/textcolor.svg",
        alt: "Text color",
      },
    ],
    [
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/link.svg",
        alt: "Link",
      },
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/image-3.svg",
        alt: "Image",
      },
    ],
    [
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/alignleft.svg",
        alt: "Align left",
      },
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/aligncenter.svg",
        alt: "Align center",
      },
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/alignright.svg",
        alt: "Align right",
      },
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/justifytext.svg",
        alt: "Justify text",
      },
    ],
    [
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/spacing.svg",
        alt: "Spacing",
      },
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/indent-left.svg",
        alt: "Indent left",
      },
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/indentright.svg",
        alt: "Indent right",
      },
      {
        src: "https://c.animaapp.com/macke9kyh9ZtZh/img/removestyle.svg",
        alt: "Remove style",
      },
    ],
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

  // --- À INSÉRER dans CentralEditor, à la place ou en adaptation de ta fonction renderMenuItems ---
  const renderMenuItems = () => (
    <NavigationMenuList className="flex items-center gap-2">
      {menuItems.map((menuItem, index) => (
        <NavigationMenuItem key={index}>
          {menuItem.items ? (
            <NavigationMenu>
              {/* ----- Menu principal (Edition, Insérer, Outils) ----- */}
              <NavigationMenuTrigger className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30 transition">
                {menuItem.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="ring-1 ring-gray-200 focus:outline-none focus:ring-0 border border-gray-200">
                <ul>
                  {menuItem.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      {/* ---- Boutons des items : fond blanc, hover/active bleu doux, focus discret ---- */}
                      <button
                        className="w-full text-left px-4 py-1 bg-white hover:bg-blue-100 focus:bg-blue-100 active:bg-blue-200 text-gray-800 rounded transition-colors duration-150 whitespace-nowrap justify-start"
                        onClick={() => console.log(`Clicked: ${item}`)}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenu>
          ) : (
            // ----- Dernier bouton "Aide" avec style accentué -----
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

      <div className="flex flex-wrap items-center justify-center gap-[16px_20px] p-4 bg-white border border-[#e1e1e2]">
        {toolbarIcons.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="inline-flex items-center justify-center gap-3 flex-[0_0_auto]"
          >
            {group.map((icon, iconIndex) => (
              <Button
                key={iconIndex}
                variant="ghost"
                size="icon"
                className="p-1 hover:bg-gray-100 transition-colors duration-200"
              >
                <img className="w-6 h-6" alt={icon.alt} src={icon.src} />
              </Button>
            ))}

            {groupIndex === 1 && (
              <>
                <div className="inline-flex items-center gap-1">
                  <Button
                    variant="ghost"
                    className="inline-flex h-8 items-center gap-1 px-2 py-1 bg-zinc-100 rounded overflow-hidden hover:bg-zinc-200 transition-colors duration-200"
                  >
                    <span className="font-text-sm-font-medium text-zinc-600 whitespace-nowrap">
                      Arial
                    </span>
                    <img
                      className="w-4 h-4"
                      alt="Icon"
                      src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-2.svg"
                    />
                  </Button>

                  <div className="inline-flex h-8 items-center justify-center gap-1 bg-[#fcfcfc] rounded-xl border border-solid border-[#e1e1e2] shadow-shadow-xs">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex items-center justify-center w-8 h-8 rounded-l-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <img
                        className="w-4 h-4"
                        alt="Decrease font size"
                        src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon.svg"
                      />
                    </Button>
                    <div className="w-[30px] font-text-sm-font-medium text-[#1a1a1ab2] text-center">
                      16
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex items-center justify-center w-8 h-8 rounded-r-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <img
                        className="w-4 h-4"
                        alt="Increase font size"
                        src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-1.svg"
                      />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {groupIndex === 2 && (
              <div className="inline-flex h-8 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-1 hover:bg-gray-100 transition-colors duration-200"
                >
                  <img
                    className="w-6 h-6"
                    alt="Icon"
                    src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-6.svg"
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-1 hover:bg-gray-100 transition-colors duration-200"
                >
                  <img
                    className="w-6 h-6"
                    alt="Icon"
                    src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-2.svg"
                  />
                </Button>
              </div>
            )}

            {groupIndex === 4 && (
              <div className="inline-flex h-8 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-1 hover:bg-gray-100 transition-colors duration-200"
                >
                  <img
                    className="w-6 h-6"
                    alt="Icon"
                    src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-8.svg"
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-1 hover:bg-gray-100 transition-colors duration-200"
                >
                  <img
                    className="w-6 h-6"
                    alt="Icon"
                    src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-2.svg"
                  />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col flex-grow overflow-hidden">
        <CardContent
          className="gap-6 pt-8 pb-0 px-16 flex-grow overflow-auto"
          ref={cardContentRef}
        >
          <h1 className="self-stretch mt-[-1.00px] font-text-5xl-font-semibold text-[#1a1a1a]">
            WYSIWYG
          </h1>

          <h2 className="self-stretch font-text-2xl-font-regular text-[#1a1a1ab2]">
            Rich Text Editor Component in Figma
          </h2>

          <div className="flex flex-col items-start gap-4 self-stretch w-full">
            {checklistItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 self-stretch w-full"
              >
                {item.checked ? (
                  <img
                    className="w-8 h-8"
                    alt="Checkbox"
                    src="https://c.animaapp.com/macke9kyh9ZtZh/img/checkbox.svg"
                  />
                ) : (
                  <Checkbox className="w-8 h-8 bg-zinc-100 rounded-xl border-2 border-[#e1e1e2] shadow-shadow-sm" />
                )}
                <div className="flex-1 mt-[-1.00px] font-text-xl-font-medium text-[#1a1a1a]">
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-start gap-[8px_0px] self-stretch w-full">
            {featureItems.map((feature, index) => (
              <div
                key={index}
                className="flex-1 font-text-2xl-font-regular text-[#1a1a1a]"
              >
                {feature}
              </div>
            ))}
          </div>

          <div className="self-stretch w-full h-[640px] border border-solid border-[#e1e1e2] bg-[url(https://c.animaapp.com/macke9kyh9ZtZh/img/image-4.svg)] bg-cover bg-[50%_50%]" />
        </CardContent>

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
    </Card>
  );
};
