// src/extensions/Task.ts
import { Node, mergeAttributes } from "@tiptap/core";


// 🧠 Tâche DITA
export const Task = Node.create({
  name: "task",
  group: "document",
  content: "title prolog? taskbody",
  defining: true,
  selectable: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "task" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["task", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      insertTask:
        (attrs = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: "task",
            attrs,
            content: [
              {
                type: "title",
                content: [{ type: "text", text: "Titre de la tâche" }],
              },
              {
                type: "prolog",
                content: [],
              },
              {
                type: "taskbody",
                content: [
                  {
                    type: "steps",
                    content: [
                      {
                        type: "step",
                        content: [
                          { type: "paragraph", content: [{ type: "text", text: "Étape 1..." }] },
                        ],
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


// src/extensions/Taskbody.ts
export const Taskbody = Node.create({
  name: "taskbody",
  group: "block",
  content: "steps",
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "taskbody" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["taskbody", mergeAttributes(HTMLAttributes), 0];
  },
});


// src/extensions/Steps.ts
export const Steps = Node.create({
  name: "steps",
  group: "block",
  content: "step+",
  defining: true,

  parseHTML() {
    return [{ tag: "steps" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["steps", mergeAttributes(HTMLAttributes), 0];
  },
});

// src/extensions/Step.ts
export const Step = Node.create({
  name: "step",
  group: "block",
  content: "block+",
  defining: true,
  selectable: true,

  parseHTML() {
    return [{ tag: "step" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["step", mergeAttributes(HTMLAttributes), 0];
  },
});