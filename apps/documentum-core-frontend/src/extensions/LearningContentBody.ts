// src/extensions/LearningContentBody.ts
import { Node, mergeAttributes } from "@tiptap/core";

export const LearningContentBody = Node.create({
  name: "learningContentBody",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "learningContentBody" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["learningContentBody", mergeAttributes(HTMLAttributes), 0];
  },
});

export default LearningContentBody;
