// src/extensions/Concept.ts
import { Node, mergeAttributes } from "@tiptap/core";

const Concept = Node.create({
  name: "concept",
  group: "block",
  content: "block*",
  draggable: true,
  parseHTML() {
    return [{ tag: "concept" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["concept", mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      insertConcept:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: "concept",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Nouveau bloc Concept..." }],
              },
            ],
          }),
    };
  },
});

export default Concept;