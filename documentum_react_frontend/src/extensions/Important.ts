import { Node, mergeAttributes } from "@tiptap/core";

const Important = Node.create({
  name: "important",
  group: "block",
  content: "block*",
  defining: true,
  draggable: true,
  parseHTML() {
    return [{ tag: "important" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["important", mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setImportant:
        () =>
        ({ commands }) =>
          commands.setNode("important"),
    };
  },
});

export default Important;

