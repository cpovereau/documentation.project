// src/extensions/Question.ts
import { Node, mergeAttributes } from "@tiptap/core";

export const Question = Node.create({
  name: "question",
  group: "block",
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "question" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["question", mergeAttributes(HTMLAttributes), 0];
  },
});

export default Question;
