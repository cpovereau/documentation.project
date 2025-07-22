// src/extensions/LearningAssessment.ts
import { Node, mergeAttributes } from "@tiptap/core";

// 📝 Extension pour les évaluations d'apprentissage DITA
export const LearningAssessment = Node.create({
  name: "learningAssessment",
  group: "document",
  content: "question+ answer+",
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
      mode: {
        default: "single", // 'single' (radio) or 'multiple' (checkbox)
        parseHTML: (el) => el.getAttribute("mode") || "single",
        renderHTML: (attrs) => ({ mode: attrs.mode }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "learningAssessment" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["learningAssessment", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      insertAssessment:
        (attrs = { mode: "single" }) =>
        ({ commands }) =>
          commands.insertContent({
            type: "learningAssessment",
            attrs,
            content: [
              {
                type: "question",
                content: [{ type: "text", text: "Quelle est la capitale de la France ?" }],
              },
              {
                type: "answer",
                attrs: { correct: "yes" },
                content: [{ type: "text", text: "Paris" }],
              },
              {
                type: "answer",
                attrs: { correct: "no" },
                content: [{ type: "text", text: "Londres" }],
              },
              {
                type: "answer",
                attrs: { correct: "no" },
                content: [{ type: "text", text: "Berlin" }],
              },
            ],
          }),
    };
  },
});

// src/extensions/LearningBody.ts
export const LearningBody = Node.create({
  name: "learningBody",
  group: "block",
  content: "learningSummary learningContentBody",
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "learningBody" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["learningBody", mergeAttributes(HTMLAttributes), 0];
  },
});

// src/extensions/LearningContent.ts
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

// src/extensions/LearningContentBody.ts
export const LearningContentBody = Node.create({
  name: "learningContentBody",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "learningContentBody" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["learningContentBody", mergeAttributes(HTMLAttributes), 0];
  },
});

// src/extensions/LearningSummary.ts
export const LearningSummary = Node.create({
  name: "learningSummary",
  group: "block",
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "learningSummary" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["learningSummary", mergeAttributes(HTMLAttributes), 0];
  },
});