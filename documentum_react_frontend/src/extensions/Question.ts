// src/extensions/Question.ts
import { Node, mergeAttributes } from "@tiptap/core";

const Question = Node.create({
  name: "question",
  group: "block",
  content: "answer+",
  draggable: true,
  addAttributes() {
    return {
      id: { default: null },
      text: { default: "" },
    };
  },
  parseHTML() {
    return [{ tag: "question" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["question", mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      insertQuestion:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: "question",
            content: [],
          }),
    };
  },
});
export default Question;
