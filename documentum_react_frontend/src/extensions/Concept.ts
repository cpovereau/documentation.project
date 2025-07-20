// src/extensions/Concept.ts
import { Node, mergeAttributes } from "@tiptap/core";

const Concept = Node.create({
  name: "concept",
  group: "block",
  content: "block*",
  draggable: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
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
                type: "paragraph",
                content: [{ type: "text", text: "Nouveau bloc Concept..." }],
              },
            ],
          }),
    };
  },
});

export default Concept;
