import { Node, mergeAttributes } from "@tiptap/core";

const Warning = Node.create({
  name: "warning",
  group: "block",
  content: "block*",
  defining: true,
  draggable: true,
  parseHTML() {
    return [{ tag: "warning" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["warning", mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      insertWarning:
        (attrs = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: "warning",
            attrs,
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Nouveau bloc Avertissement..." }],
              },
            ],
          }),
    };
  },
});

export default Warning;
