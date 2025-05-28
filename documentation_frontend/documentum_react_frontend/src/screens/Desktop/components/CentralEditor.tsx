import React, { useState } from "react";
import { Button } from "components/ui/button";
import { Card, CardContent } from "components/ui/card";
import { Checkbox } from "components/ui/checkbox";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "components/ui/navigation-menu";

export const CentralEditor = (): JSX.Element => {
  const [content, setContent] = useState("");

  const menuItems = [
    "File",
    "Edit",
    "View",
    "Insert",
    "Format",
    "Tools",
    "Help",
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

  return (
    <Card className="flex flex-col w-full h-full border border-[#e1e1e2] shadow-shadow-md rounded-xl overflow-hidden">
      <header className="flex items-center px-6 py-3 bg-[#fcfcfc] border-b border-[#e1e1e2]">
        <NavigationMenu className="flex-1">
          <NavigationMenuList className="flex items-center gap-1">
            {menuItems.map((item, index) => (
              <NavigationMenuItem key={index}>
                <div className="inline-flex h-11 items-center justify-center gap-2 px-4 py-0 rounded-xl overflow-hidden">
                  <span className="font-text-base-font-semibold text-[#1a1a1ab2] whitespace-nowrap">
                    {item}
                  </span>
                </div>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <Button className="h-11 px-4 py-0 bg-[#2463eb] rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14]">
          Preview
        </Button>
      </header>

      <div className="flex flex-wrap items-center justify-center gap-[16px_20px] p-4 bg-white border border-[#e1e1e2]">
        {toolbarIcons.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="inline-flex items-center justify-center gap-3 flex-[0_0_auto]"
          >
            {group.map((icon, iconIndex) => (
              <img
                key={iconIndex}
                className="w-6 h-6 cursor-pointer"
                alt={icon.alt}
                src={icon.src}
              />
            ))}

            {groupIndex === 1 && (
              <>
                <div className="inline-flex items-center gap-1">
                  <div className="inline-flex h-6 items-center gap-1 px-1 py-0 bg-zinc-100 rounded overflow-hidden">
                    <div className="font-text-sm-font-medium text-zinc-600 whitespace-nowrap">
                      Arial
                    </div>
                    <img
                      className="w-6 h-6"
                      alt="Icon"
                      src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-2.svg"
                    />
                  </div>

                  <div className="inline-flex h-6 items-center justify-center gap-1 bg-[#fcfcfc] rounded-xl border border-solid border-[#e1e1e2] shadow-shadow-xs">
                    <div className="flex flex-col w-9 h-6 items-center justify-center rounded-xl shadow-[0px_1px_2px_#1a1a1a14]">
                      <img
                        className="w-5 h-5"
                        alt="Icon"
                        src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon.svg"
                      />
                    </div>
                    <div className="self-stretch w-[21px] font-text-sm-font-medium text-[#1a1a1ab2] text-center whitespace-nowrap">
                      00
                    </div>
                    <div className="flex flex-col w-9 h-6 items-center justify-center rounded-xl shadow-[0px_1px_2px_#1a1a1a14]">
                      <img
                        className="w-5 h-5"
                        alt="Icon"
                        src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-1.svg"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {groupIndex === 2 && (
              <div className="inline-flex h-6 items-center gap-1">
                <img
                  className="w-6 h-6"
                  alt="Icon"
                  src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-6.svg"
                />
                <img
                  className="w-6 h-6"
                  alt="Icon"
                  src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-2.svg"
                />
              </div>
            )}

            {groupIndex === 4 && (
              <div className="inline-flex h-6 items-center gap-1">
                <img
                  className="w-6 h-6"
                  alt="Icon"
                  src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-8.svg"
                />
                <img
                  className="w-6 h-6"
                  alt="Icon"
                  src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-2.svg"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <CardContent className="gap-6 pt-8 pb-0 px-16 flex-1 overflow-auto">
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
    </Card>
  );
};
