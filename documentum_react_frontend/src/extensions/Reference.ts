// src/extensions/Reference.ts
import { Node, mergeAttributes } from "@tiptap/core";


// 🧩 Extension pour le nœud <reference> dans TipTap
export const Reference = Node.create({
  name: "reference",
  group: "document",
  content: "title prolog? refbody",
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "reference" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["reference", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      insertReference:
        (attrs = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: "reference",
            attrs,
            content: [
              {
                type: "title",
                content: [{ type: "text", text: "Titre de la référence" }],
              },
              {
                type: "prolog",
                content: [],
              },
              {
                type: "refbody",
                content: [
                  {
                    type: "section",
                    content: [
                      {
                        type: "paragraph",
                        content: [{ type: "text", text: "Contenu de référence..." }],
                      },
                    ],
                  },
                ],
              },
            ],
          }),
    };
  },
});


// Export the Reference node for use in the editor
export const Refbody = Node.create({
  name: "refbody",
  group: "block",
  content: "section+",
  defining: true,

  parseHTML() {
    return [{ tag: "refbody" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["refbody", mergeAttributes(HTMLAttributes), 0];
  },
});
