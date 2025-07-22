// src/extensions/Title.ts
import { Node, mergeAttributes } from "@tiptap/core";

export const Title = Node.create({
  name: "title",
  group: "block",
  content: "inline*",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "title",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["title", mergeAttributes(HTMLAttributes), 0];
  },
});
