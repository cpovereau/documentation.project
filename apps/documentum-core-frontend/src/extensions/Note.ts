// src/extensions/Note.ts
import { Node, mergeAttributes } from "@tiptap/core";

export const Note = Node.create({
  name: "note",
  group: "block",
  content: "inline*",
  defining: true,
  isolating: false,

  addAttributes() {
    return {
      type: {
        default: "note",
        parseHTML: (element) => element.getAttribute("type") || "note",
        renderHTML: (attributes) => {
          return { type: attributes.type };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "note" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["note", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      insertNote:
        (attrs = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: "note",
            attrs,
            content: [
              {
                type: "text",
                text: attrs.type === "warning"
                  ? "⚠️ Attention : contenu critique."
                  : attrs.type === "important"
                  ? "🔔 Information importante."
                  : "💬 Note informative.",
              },
            ],
          }),
    };
  },
});
