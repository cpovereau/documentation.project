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
      setNote:
        () =>
        ({ commands }) =>
          commands.setNode("note"),
    };
  },
});

export default Note;