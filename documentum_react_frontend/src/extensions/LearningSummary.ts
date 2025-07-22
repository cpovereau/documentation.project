// src/extensions/LearningSummary.ts
import { Node, mergeAttributes } from "@tiptap/core";

export const LearningSummary = Node.create({
  name: "learningSummary",
  group: "block",
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "learningSummary" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["learningSummary", mergeAttributes(HTMLAttributes), 0];
  },
});

export default LearningSummary;
