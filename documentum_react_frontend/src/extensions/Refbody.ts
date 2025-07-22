// src/extensions/Refbody.ts
import { Node, mergeAttributes } from "@tiptap/core";

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
