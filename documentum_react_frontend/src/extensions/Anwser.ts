// src/extensions/Answer.ts
import { Node, mergeAttributes } from "@tiptap/core";

const Answer = Node.create({
  name: "answer",
  group: "block",
  content: "inline*",
  draggable: true,
  addAttributes() {
    return {
      correct: {
        default: false,
        parseHTML: (element) => element.getAttribute("correct") === "true",
        renderHTML: (attributes) => ({
          correct: attributes.correct ? "true" : "false",
        }),
      },
      id: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [{ tag: "answer" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["answer", mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      insertAnswer:
        (attrs = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: "answer",
            attrs,
            content: [
              {
                type: "text",
                text: "Nouvelle réponse...",
              },
            ],
          }),
    };
  },
});

export default Answer;
