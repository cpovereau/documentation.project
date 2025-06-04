// src/extensions/Reference.ts
import { Node, mergeAttributes } from "@tiptap/core";

const Reference = Node.create({
  name: "reference",
  group: "block",
  content: "block*",
  draggable: true,
  parseHTML() {
    return [{ tag: "reference" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["reference", mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      insertReference:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: "reference",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Nouveau bloc Reference..." }],
              },
            ],
          }),
    };
  },
});

export default Reference;
