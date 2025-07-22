// src/extensions/LearningContent.ts
import { Node, mergeAttributes } from "@tiptap/core";

export const LearningContent = Node.create({
  name: "learningContent",
  group: "document",
  content: "title learningBody",
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "learningContent" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["learningContent", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      insertLearningContent:
        (attrs = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: "learningContent",
            attrs,
            content: [
              {
                type: "title",
                content: [{ type: "text", text: "Titre de l'exercice" }],
              },
              {
                type: "learningBody",
                content: [
                  {
                    type: "learningSummary",
                    content: [{ type: "text", text: "Résumé pédagogique..." }],
                  },
                  {
                    type: "learningContentBody",
                    content: [
                      {
                        type: "paragraph",
                        content: [{ type: "text", text: "Énoncé de l'exercice ici." }],
                      },
                    ],
                  },
                ],
              },
            ],
          }),
    };
  },
});

export default LearningContent;