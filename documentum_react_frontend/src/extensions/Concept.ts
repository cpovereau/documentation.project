// src/extensions/Concept.ts
import { Node, mergeAttributes } from "@tiptap/core";


// 🧠 Concept node for DITA structure
export const Concept = Node.create({
  name: "concept",
  group: "document",
  content: "title prolog? conbody",
  defining: true,
  selectable: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "concept" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["concept", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      insertConcept:
        (attrs = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: "concept",
            attrs,
            content: [
              {
                type: "title",
                content: [{ type: "text", text: "Titre du concept" }],
              },
              {
                type: "prolog",
                content: [],
              },
              {
                type: "conbody",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Contenu initial du concept..." }],
                  },
                ],
              },
            ],
          }),
    };
  },
});


// Export the Concept node
export const Conbody = Node.create({
  name: "conbody",
  group: "block",
  content: "block*",
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "conbody",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["conbody", mergeAttributes(HTMLAttributes), 0];
  },
});
