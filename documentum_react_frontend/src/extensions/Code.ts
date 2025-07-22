// src/extensions/Code.ts
import { Node, mergeAttributes } from "@tiptap/core";

export const Code = Node.create({
  name: "codeblock",
  group: "block",
  content: "text*",
  code: true,
  marks: "",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      language: {
        default: "plaintext",
        parseHTML: element => element.getAttribute("language") || "plaintext",
        renderHTML: attrs => ({ language: attrs.language }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "codeblock",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["codeblock", mergeAttributes(HTMLAttributes), 0];
  },
});
