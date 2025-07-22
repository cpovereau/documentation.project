// src/extensions/Answer.ts
import { Node, mergeAttributes } from "@tiptap/core";

export const Answer = Node.create({
  name: "answer",
  group: "block",
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
      correct: {
        default: "no",
        parseHTML: (el) => el.getAttribute("correct") || "no",
        renderHTML: (attrs) => ({ correct: attrs.correct }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "answer" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["answer", mergeAttributes(HTMLAttributes), 0];
  },
});
