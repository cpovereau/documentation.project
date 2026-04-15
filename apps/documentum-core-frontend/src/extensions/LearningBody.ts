// src/extensions/LearningBody.ts
import { Node, mergeAttributes } from "@tiptap/core";

export const LearningBody = Node.create({
  name: "learningBody",
  group: "block",
  content: "learningSummary learningContentBody",
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "learningBody" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["learningBody", mergeAttributes(HTMLAttributes), 0];
  },
});

export default LearningBody;
