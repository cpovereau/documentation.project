import { Node, mergeAttributes } from "@tiptap/core";

const Note = Node.create({
  name: "note",
  group: "block",
  content: "block*",
  defining: true,
  draggable: true,
  parseHTML() {
    return [{ tag: "note" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["note", mergeAttributes(HTMLAttributes), 0];
  },
 addCommands() {
    return {
      insertNote:
        (attrs = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: "note",
            attrs,
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Nouveau bloc Note..." }],
              },
            ],
          }),
    };
  },
});

export default Note;